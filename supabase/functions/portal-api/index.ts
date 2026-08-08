import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function db() {
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const norm = (v: unknown) => String(v ?? "").trim();

type Auth = {
  schoolId: number;
  code: string;
  credentials: string;
};

async function requireSchool(auth: Auth) {
  const schoolId = Number(auth?.schoolId);
  if (!Number.isInteger(schoolId) || schoolId <= 0)
    throw new Error("Invalid school id");

  const client = db();
  const { data, error } = await client
    .from("schools")
    .select(
      "id, code, name, town, category, school_type, motto, credentials",
    )
    .eq("id", schoolId)
    .maybeSingle();

  if (error) throw new Error("Could not verify institution");
  if (
    !data ||
    norm(data.code).toUpperCase() !== norm(auth.code).toUpperCase() ||
    !norm(data.credentials) ||
    norm(data.credentials) !== norm(auth.credentials)
  ) {
    throw new Error("Invalid school ID, school code or credentials");
  }

  const { credentials, ...school } = data;
  void credentials;
  return { client, school };
}

const DOCUMENT_COLUMNS: Record<string, string> = {
  prospectus: "prospectus_path",
  undertaking_form: "undertaking_form_path",
  programme_subjects: "programme_subjects_path",
  admission_letter: "admission_letter_path",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");
    const auth = body.auth as Auth | undefined;

    switch (action) {
      case "schoolLogin": {
        const result = await requireSchool(auth!);
        return json({ school: result.school });
      }

      case "getDashboardSummary": {
        const { client, school } = await requireSchool(auth!);
        const [placements, students, records, houses, classes, unassigned, settings] =
          await Promise.all([
            client
              .from("placements")
              .select("id", { count: "exact", head: true })
              .eq("school_id", school.id),
            client
              .from("students")
              .select("id", { count: "exact", head: true })
              .eq("school_id", school.id),
            client
              .from("students")
              .select("id", { count: "exact", head: true })
              .eq("school_id", school.id)
              .not("status", "is", null),
            client
              .from("houses")
              .select("id", { count: "exact", head: true })
              .eq("school_id", school.id),
            client
              .from("classes")
              .select("id", { count: "exact", head: true })
              .eq("school_id", school.id),
            client
              .from("students")
              .select("id", { count: "exact", head: true })
              .eq("school_id", school.id)
              .or("house_id.is.null,class_id.is.null"),
            client
              .from("schools")
              .select(
                "motto, admission_letter_template, principal_name, contact_phone, contact_email, postal_address, website, established_year, reopening_date, current_cycle, cycle_status, prospectus_path, undertaking_form_path, programme_subjects_path, admission_letter_path",
              )
              .eq("id", school.id)
              .maybeSingle(),
          ]);

        return json({
          school,
          counts: {
            placements: placements.count ?? 0,
            students: students.count ?? 0,
            records: records.count ?? 0,
            houses: houses.count ?? 0,
            classes: classes.count ?? 0,
            unassigned: unassigned.count ?? 0,
          },
          settings: settings.data,
        });
      }

      case "listPlacements": {
        const { client, school } = await requireSchool(auth!);
        const { data, error } = await client
          .from("placements")
          .select(
            "id, index_no, candidate_name, gender, date_of_birth, jhs_attended, programme_code, programme, residency, enrolment_code, aggregate, completion_year, phone",
          )
          .eq("school_id", school.id)
          .order("created_at", { ascending: false })
          .limit(500);
        if (error) throw error;
        return json({ rows: data ?? [] });
      }

      case "uploadPlacements": {
        const { client, school } = await requireSchool(auth!);
        const rows = Array.isArray(body.rows) ? body.rows : [];
        if (rows.length === 0 || rows.length > 2000)
          return json({ error: "1-2000 rows required" }, 400);

        let saved = 0;
        const errors: { index_no: string; reason: string }[] = [];

        for (const row of rows) {
          const indexNo = norm(row?.index_no);
          const candidateName = norm(row?.candidate_name);
          const programme = norm(row?.programme);
          const completionYear = norm(row?.completion_year);

          if (!indexNo || !candidateName || !programme || !completionYear) {
            errors.push({
              index_no: indexNo || "(blank)",
              reason: "Missing required field (index_no, candidate_name, programme, completion_year)",
            });
            continue;
          }

          const { error: upErr } = await client
            .from("placements")
            .upsert(
              {
                index_no: indexNo,
                candidate_name: candidateName,
                gender: norm(row?.gender) || null,
                date_of_birth: norm(row?.date_of_birth) || null,
                jhs_attended: norm(row?.jhs_attended) || null,
                programme_code: norm(row?.programme_code) || null,
                programme,
                residency: norm(row?.residency) || null,
                enrolment_code: norm(row?.enrolment_code) || null,
                aggregate: row?.aggregate != null ? Number(row.aggregate) : null,
                completion_year: completionYear,
                phone: norm(row?.phone) || null,
                school_id: school.id,
              },
              { onConflict: "school_id,index_no,completion_year" },
            );

          if (upErr) {
            errors.push({ index_no: indexNo, reason: upErr.message });
          } else {
            saved += 1;
          }
        }

        return json({ saved, failed: errors.length, errors });
      }

      case "syncPlacementsToStudents": {
        const { client, school } = await requireSchool(auth!);
        const { data: placements, error: pErr } = await client
          .from("placements")
          .select(
            "index_no, candidate_name, gender, date_of_birth, jhs_attended, programme_code, programme, residency, enrolment_code, aggregate, completion_year, phone",
          )
          .eq("school_id", school.id);
        if (pErr) throw pErr;

        let synced = 0;
        for (const p of placements ?? []) {
          const { error: sErr } = await client
            .from("students")
            .upsert(
              {
                index_no: p.index_no,
                full_name: p.candidate_name,
                gender: p.gender,
                date_of_birth: p.date_of_birth,
                jhs_attended: p.jhs_attended,
                programme: p.programme,
                residency: p.residency,
                enrolment_code: p.enrolment_code,
                aggregate: p.aggregate,
                completion_year: p.completion_year,
                phone: p.phone,
                school_id: school.id,
              },
              { onConflict: "school_id,index_no" },
            );
          if (sErr) {
            console.error("sync error for", p.index_no, sErr.message);
          } else {
            synced += 1;
          }
        }

        return json({ synced, failed: (placements?.length ?? 0) - synced });
      }

      case "listStudentRecords": {
        const { client, school } = await requireSchool(auth!);
        const { data, error } = await client
          .from("students")
          .select(
            "id, index_no, full_name, gender, programme, residency, enrolment_code, aggregate, phone, email, address, status, house_id, class_id",
          )
          .eq("school_id", school.id)
          .order("full_name", { ascending: true });
        if (error) throw error;
        return json({ rows: data ?? [] });
      }

      case "getAssignmentData": {
        const { client, school } = await requireSchool(auth!);
        const [houses, classes, students] = await Promise.all([
          client
            .from("houses")
            .select("id, name, gender, housemaster_name, capacity")
            .eq("school_id", school.id)
            .order("name"),
          client
            .from("classes")
            .select("id, name, form_level, programme, form_master_name")
            .eq("school_id", school.id)
            .order("name"),
          client
            .from("students")
            .select("id, index_no, full_name, programme, residency, house_id, class_id")
            .eq("school_id", school.id)
            .order("full_name"),
        ]);
        return json({
          houses: houses.data ?? [],
          classes: classes.data ?? [],
          students: students.data ?? [],
        });
      }

      case "assignHousesAndClasses": {
        const { client, school } = await requireSchool(auth!);
        const assignments = Array.isArray(body.assignments) ? body.assignments : [];
        if (assignments.length === 0 || assignments.length > 2000)
          return json({ error: "1-2000 assignments required" }, 400);

        const [houses, classes] = await Promise.all([
          client.from("houses").select("id, name").eq("school_id", school.id),
          client.from("classes").select("id, name").eq("school_id", school.id),
        ]);

        const houseByName = new Map(
          (houses.data ?? []).map((h) => [h.name.trim().toLowerCase(), h.id]),
        );
        const classByName = new Map(
          (classes.data ?? []).map((c) => [c.name.trim().toLowerCase(), c.id]),
        );

        let updated = 0;
        const errors: { index_no: string; reason: string }[] = [];
        const now = new Date().toISOString();

        for (const row of assignments) {
          const indexNo = norm(row?.index_no).replace(/\s/g, "");
          if (!indexNo) {
            errors.push({ index_no: "", reason: "Missing index number" });
            continue;
          }

          const patch: Record<string, unknown> = {};
          const houseName = row?.house ? String(row.house).trim().toLowerCase() : "";
          const className = row?.class ? String(row.class).trim().toLowerCase() : "";

          if (houseName) {
            const houseId = houseByName.get(houseName);
            if (!houseId) {
              errors.push({ index_no: indexNo, reason: `Unknown house "${row.house}"` });
              continue;
            }
            patch.house_id = houseId;
            patch.house_assigned_at = now;
          }
          if (className) {
            const classId = classByName.get(className);
            if (!classId) {
              errors.push({ index_no: indexNo, reason: `Unknown class "${row.class}"` });
              continue;
            }
            patch.class_id = classId;
            patch.class_assigned_at = now;
          }
          if (Object.keys(patch).length === 0) {
            errors.push({ index_no: indexNo, reason: "No house or class supplied" });
            continue;
          }

          const { data: updated_rows, error: upErr } = await client
            .from("students")
            .update(patch)
            .eq("index_no", indexNo)
            .eq("school_id", school.id)
            .select("id");
          if (upErr) {
            errors.push({ index_no: indexNo, reason: upErr.message });
          } else if (!updated_rows || updated_rows.length === 0) {
            errors.push({
              index_no: indexNo,
              reason: "No student with this index number at this school",
            });
          } else {
            updated += 1;
          }
        }

        return json({ updated, failed: errors.length, errors });
      }

      case "updateSchoolSettings": {
        const { client, school } = await requireSchool(auth!);
        const patch: Record<string, string | null> = {};
        if (typeof body.admission_letter_template === "string")
          patch.admission_letter_template = body.admission_letter_template;
        if (typeof body.motto === "string") patch.motto = body.motto;
        if (Object.keys(patch).length === 0)
          return json({ error: "No settings to update" }, 400);

        const { error } = await client
          .from("schools")
          .update(patch)
          .eq("id", school.id);
        if (error) throw error;
        return json({ updated: true });
      }

      case "createDocumentUploadUrl": {
        const { client, school } = await requireSchool(auth!);
        const kind = String(body.kind ?? "");
        const fileName = String(body.fileName ?? "");
        const column = DOCUMENT_COLUMNS[kind];
        if (!column) return json({ error: "Invalid document kind" }, 400);
        if (!fileName) return json({ error: "Missing fileName" }, 400);

        const ext = fileName.slice(fileName.lastIndexOf("."));
        const path = `${school.code}/${kind}-${Date.now()}${ext}`;

        const { data, error } = await client.storage
          .from("school-documents")
          .createSignedUploadUrl(path);
        if (error) throw error;

        return json({ path: data.path, token: data.token });
      }

      case "finalizeDocumentUpload": {
        const { client, school } = await requireSchool(auth!);
        const kind = String(body.kind ?? "");
        const path = String(body.path ?? "");
        const column = DOCUMENT_COLUMNS[kind];
        if (!column) return json({ error: "Invalid document kind" }, 400);
        if (!path) return json({ error: "Missing path" }, 400);

        const { error } = await client
          .from("schools")
          .update({ [column]: path })
          .eq("id", school.id);
        if (error) throw error;

        const { data: urlData } = client.storage
          .from("school-documents")
          .getPublicUrl(path);
        return json({ path, url: urlData.publicUrl });
      }

      case "updateInstitutionProfile": {
        const { client, school } = await requireSchool(auth!);
        const profile = body.profile as Record<string, unknown>;
        const allowed: Record<string, string | null> = {};
        for (const key of [
          "motto",
          "principal_name",
          "contact_phone",
          "contact_email",
          "postal_address",
          "website",
          "established_year",
          "reopening_date",
        ]) {
          if (typeof profile[key] === "string") {
            const value = (profile[key] as string).trim();
            allowed[key] = key === "reopening_date" && value === "" ? null : value;
          }
        }
        if (Object.keys(allowed).length === 0)
          return json({ error: "No profile fields to update" }, 400);

        const { error } = await client
          .from("schools")
          .update(allowed)
          .eq("id", school.id);
        if (error) throw error;
        return json({ updated: true });
      }

      case "listHousesAndClasses": {
        const { client, school } = await requireSchool(auth!);
        const [houses, classes] = await Promise.all([
          client
            .from("houses")
            .select("id, name, gender, housemaster_name, capacity")
            .eq("school_id", school.id)
            .order("name"),
          client
            .from("classes")
            .select("id, name, form_level, programme, form_master_name")
            .eq("school_id", school.id)
            .order("name"),
        ]);
        return json({ houses: houses.data ?? [], classes: classes.data ?? [] });
      }

      case "saveHouse": {
        const { client, school } = await requireSchool(auth!);
        const house = body.house as Record<string, unknown>;
        const payload = {
          name: norm(house?.name),
          gender: norm(house?.gender) || null,
          housemaster_name: norm(house?.housemaster_name) || null,
          capacity: house?.capacity != null ? Number(house.capacity) : null,
          school_id: school.id,
        };
        if (!payload.name) return json({ error: "House name required" }, 400);

        if (house?.id) {
          const { error } = await client
            .from("houses")
            .update(payload)
            .eq("id", Number(house.id))
            .eq("school_id", school.id);
          if (error) throw error;
        } else {
          const { error } = await client.from("houses").insert(payload);
          if (error) throw error;
        }
        return json({ saved: true });
      }

      case "deleteHouse": {
        const { client, school } = await requireSchool(auth!);
        const { error } = await client
          .from("houses")
          .delete()
          .eq("id", Number(body.id))
          .eq("school_id", school.id);
        if (error) throw error;
        return json({ deleted: true });
      }

      case "saveClass": {
        const { client, school } = await requireSchool(auth!);
        const klass = body.klass as Record<string, unknown>;
        const payload = {
          name: norm(klass?.name),
          form_level: klass?.form_level != null ? Number(klass.form_level) : null,
          programme: norm(klass?.programme) || null,
          form_master_name: norm(klass?.form_master_name) || null,
          school_id: school.id,
        };
        if (!payload.name) return json({ error: "Class name required" }, 400);

        if (klass?.id) {
          const { error } = await client
            .from("classes")
            .update(payload)
            .eq("id", Number(klass.id))
            .eq("school_id", school.id);
          if (error) throw error;
        } else {
          const { error } = await client.from("classes").insert(payload);
          if (error) throw error;
        }
        return json({ saved: true });
      }

      case "deleteClass": {
        const { client, school } = await requireSchool(auth!);
        const { error } = await client
          .from("classes")
          .delete()
          .eq("id", Number(body.id))
          .eq("school_id", school.id);
        if (error) throw error;
        return json({ deleted: true });
      }

      case "setAdmissionCycle": {
        const { client, school } = await requireSchool(auth!);
        const cycle = norm(body.cycle);
        const status = body.status ? norm(body.status) : "open";
        if (!cycle) return json({ error: "Cycle name required" }, 400);

        const { error } = await client
          .from("schools")
          .update({ current_cycle: cycle, cycle_status: status })
          .eq("id", school.id);
        if (error) throw error;
        return json({ cycle, status });
      }

      case "clearCycleData": {
        const { client, school } = await requireSchool(auth!);
        const confirm = norm(body.confirm);
        if (confirm !== school.code)
          return json({ error: "Confirmation does not match school code" }, 400);

        const cleared: Record<string, number> = {};
        for (const [table, filter] of [
          ["placements", { school_id: school.id }],
          ["students", { school_id: school.id }],
        ] as const) {
          const { count, error } = await client
            .from(table)
            .delete({ count: "exact" })
            .match(filter);
          if (error) throw error;
          cleared[table] = count ?? 0;
        }

        const { error: sErr } = await client
          .from("schools")
          .update({
            current_cycle: null,
            cycle_status: null,
            prospectus_path: null,
            undertaking_form_path: null,
            programme_subjects_path: null,
            admission_letter_path: null,
          })
          .eq("id", school.id);
        if (sErr) throw sErr;

        return json({ cleared });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error("portal-api error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Server error" },
      500,
    );
  }
});
