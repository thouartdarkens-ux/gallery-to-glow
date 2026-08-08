import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ClassInput, HouseInput } from "@/lib/portal-shared";
import {
  deleteClass,
  deleteHouse,
  listHousesAndClasses,
  saveClass,
  saveHouse,
} from "@/lib/portal.functions";
import { useSession } from "@/lib/portal-session";

const emptyHouse: HouseInput = { name: "", gender: "Mixed", housemaster_name: "", capacity: null };
const emptyClass: ClassInput = {
  name: "",
  form_level: 1,
  programme: "",
  form_master_name: "",
};

export function HouseClassConfig() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [house, setHouse] = useState<HouseInput>(emptyHouse);
  const [klass, setKlass] = useState<ClassInput>(emptyClass);

  const config = useQuery({
    queryKey: ["house-class-config", session?.school.id],
    enabled: !!session,
    queryFn: () => listHousesAndClasses(session!.auth),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["house-class-config"] });
    queryClient.invalidateQueries({ queryKey: ["assignments"] });
    queryClient.invalidateQueries({ queryKey: ["summary"] });
  };

  const houseMutation = useMutation({
    mutationFn: (value: HouseInput) => saveHouse(session!.auth, value),
    onSuccess: () => {
      toast.success("House saved");
      setHouse(emptyHouse);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message || "Could not save house"),
  });

  const classMutation = useMutation({
    mutationFn: (value: ClassInput) => saveClass(session!.auth, value),
    onSuccess: () => {
      toast.success("Class saved");
      setKlass(emptyClass);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message || "Could not save class"),
  });

  const removeHouse = useMutation({
    mutationFn: (id: number) => deleteHouse(session!.auth, id),
    onSuccess: () => {
      toast.success("House deleted");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message || "Could not delete house"),
  });

  const removeClass = useMutation({
    mutationFn: (id: number) => deleteClass(session!.auth, id),
    onSuccess: () => {
      toast.success("Class deleted");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message || "Could not delete class"),
  });

  const houses = config.data?.houses ?? [];
  const classes = config.data?.classes ?? [];

  return (
    <Tabs defaultValue="houses" className="w-full">
      <TabsList>
        <TabsTrigger value="houses">Houses ({houses.length})</TabsTrigger>
        <TabsTrigger value="classes">Classes ({classes.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="houses" className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configure houses</CardTitle>
          <CardDescription>
            Boarding houses students can be assigned to. Deleting a house un-assigns its students.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              houseMutation.mutate(house);
            }}
          >
            <div className="space-y-2">
              <Label>House name *</Label>
              <Input
                value={house.name}
                required
                placeholder="Aggrey House"
                onChange={(event) => setHouse({ ...house, name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={house.gender}
                onChange={(event) => setHouse({ ...house, gender: event.target.value })}
              >
                <option value="Mixed">Mixed</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Housemaster / Housemistress</Label>
              <Input
                value={house.housemaster_name ?? ""}
                onChange={(event) => setHouse({ ...house, housemaster_name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                value={house.capacity ?? ""}
                onChange={(event) =>
                  setHouse({
                    ...house,
                    capacity: event.target.value ? Number(event.target.value.replace(/\D/g, "")) : null,
                  })
                }
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" disabled={houseMutation.isPending}>
                {house.id ? "Update house" : "Add house"}
              </Button>
              {house.id ? (
                <Button type="button" variant="ghost" onClick={() => setHouse(emptyHouse)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {houses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No houses configured yet.</p>
            ) : (
              houses.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.gender} · {row.housemaster_name || "No housemaster"} ·{" "}
                      {row.capacity ? `${row.capacity} beds` : "No capacity set"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setHouse({
                          id: row.id,
                          name: row.name,
                          gender: row.gender,
                          housemaster_name: row.housemaster_name ?? "",
                          capacity: row.capacity,
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeHouse.mutate(row.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="classes" className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configure classes</CardTitle>
          <CardDescription>
            Form classes students can be assigned to. Deleting a class un-assigns its students.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              classMutation.mutate(klass);
            }}
          >
            <div className="space-y-2">
              <Label>Class name *</Label>
              <Input
                value={klass.name}
                required
                placeholder="1 Science A"
                onChange={(event) => setKlass({ ...klass, name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Form level</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={klass.form_level}
                onChange={(event) => setKlass({ ...klass, form_level: Number(event.target.value) })}
              >
                <option value={1}>Form 1</option>
                <option value={2}>Form 2</option>
                <option value={3}>Form 3</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Programme</Label>
              <Input
                value={klass.programme ?? ""}
                placeholder="General Science"
                onChange={(event) => setKlass({ ...klass, programme: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Form master</Label>
              <Input
                value={klass.form_master_name ?? ""}
                onChange={(event) => setKlass({ ...klass, form_master_name: event.target.value })}
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" disabled={classMutation.isPending}>
                {klass.id ? "Update class" : "Add class"}
              </Button>
              {klass.id ? (
                <Button type="button" variant="ghost" onClick={() => setKlass(emptyClass)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes configured yet.</p>
            ) : (
              classes.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Form {row.form_level} · {row.programme || "Any programme"} ·{" "}
                      {row.form_master_name || "No form master"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setKlass({
                          id: row.id,
                          name: row.name,
                          form_level: row.form_level,
                          programme: row.programme ?? "",
                          form_master_name: row.form_master_name ?? "",
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeClass.mutate(row.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </TabsContent>
    </Tabs>
  );
}
