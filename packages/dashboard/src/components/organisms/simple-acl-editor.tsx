import { useMemo, useState } from "react";
import {
  ArrowRight,
  Boxes,
  Building2,
  Code2,
  Folder,
  Globe,
  Globe2,
  Lock,
  Plus,
  Server,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Unlock,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApplyPolicyRecipe } from "@/hooks/use-policy";
import { cn } from "@/lib/utils";
import { Banner } from "../atoms/banner";

interface DeviceGroup {
  id: string;
  name: string;
  description: string;
  icon: IconKey;
  deviceCount?: number;
}

interface AccessRule {
  id: string;
  sourceGroup: string;
  targetGroup: string;
  permission: "allow" | "deny";
  description?: string;
}

const GROUP_ICON_OPTIONS = [
  { key: "server", label: "Servers", icon: Server },
  { key: "developers", label: "Developers", icon: Code2 },
  { key: "office", label: "Office", icon: Building2 },
  { key: "production", label: "Production", icon: Boxes },
  { key: "ops", label: "Operations", icon: Wrench },
  { key: "general", label: "General", icon: Folder },
  { key: "secure", label: "Secure", icon: ShieldCheck },
  { key: "global", label: "Global", icon: Globe2 },
] as const;

type IconKey = (typeof GROUP_ICON_OPTIONS)[number]["key"];

const ICON_BY_KEY: Record<IconKey, LucideIcon> = GROUP_ICON_OPTIONS.reduce(
  (acc, option) => {
    acc[option.key] = option.icon;
    return acc;
  },
  {} as Record<IconKey, LucideIcon>,
);

const DEFAULT_GROUPS: DeviceGroup[] = [
  {
    id: "1",
    name: "Production Servers",
    description: "Critical production infrastructure",
    icon: "server",
    deviceCount: 12,
  },
  {
    id: "2",
    name: "Dev Team",
    description: "Engineering team devices",
    icon: "developers",
    deviceCount: 8,
  },
];

const OPEN_RULE: Omit<AccessRule, "id"> = {
  sourceGroup: "everyone",
  targetGroup: "everyone",
  permission: "allow",
  description: "Default open network - everyone can access everything",
};

type AclTab = "recipes" | "groups" | "rules";

interface SimpleAclEditorProps {
	showHeader?: boolean;
}

export function SimpleAclEditor({ showHeader = true }: SimpleAclEditorProps) {
  const [groups, setGroups] = useState<DeviceGroup[]>(DEFAULT_GROUPS);
  const [rules, setRules] = useState<AccessRule[]>([{ id: "1", ...OPEN_RULE }]);
  const [activeTab, setActiveTab] = useState<AclTab>("recipes");

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState<IconKey>("general");

  const [sourceGroup, setSourceGroup] = useState("everyone");
  const [targetGroup, setTargetGroup] = useState("everyone");
  const [permission, setPermission] = useState<"allow" | "deny">("allow");
  const [ruleDescription, setRuleDescription] = useState("");
  const applyRecipe = useApplyPolicyRecipe();

  const isNetworkOpen = useMemo(
    () =>
      rules.some(
        (rule) =>
          rule.sourceGroup === "everyone" &&
          rule.targetGroup === "everyone" &&
          rule.permission === "allow",
      ),
    [rules],
  );

  const totalDevices = useMemo(
    () => groups.reduce((sum, group) => sum + (group.deviceCount || 0), 0),
    [groups],
  );

  const groupOptions = useMemo(
    () => [{ id: "everyone", name: "Everyone", icon: "global" as IconKey }, ...groups],
    [groups],
  );

  const getGroupName = (groupId: string) => {
    if (groupId === "everyone") {
      return "Everyone";
    }

    const group = groups.find((entry) => entry.id === groupId);
    return group?.name || groupId;
  };

  const getGroupIcon = (groupId: string) => {
    if (groupId === "everyone") {
      return "global" as IconKey;
    }

    const group = groups.find((entry) => entry.id === groupId);
    return group?.icon || "general";
  };

  const renderIcon = (icon: IconKey, className = "h-4 w-4") => {
    const Icon = ICON_BY_KEY[icon];
    return <Icon className={className} />;
  };

  const addGroup = () => {
    if (!newGroupName.trim() || !newGroupDescription.trim()) {
      return;
    }

    setGroups((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        icon: newGroupIcon,
        deviceCount: 0,
      },
    ]);

    setNewGroupName("");
    setNewGroupDescription("");
    setNewGroupIcon("general");
  };

  const addRule = () => {
    if (!sourceGroup || !targetGroup) {
      return;
    }

    setRules((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sourceGroup,
        targetGroup,
        permission,
        description: ruleDescription.trim() || undefined,
      },
    ]);

    setSourceGroup("everyone");
    setTargetGroup("everyone");
    setPermission("allow");
    setRuleDescription("");
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((group) => group.id !== id));
    setRules((prev) =>
      prev.filter((rule) => rule.sourceGroup !== id && rule.targetGroup !== id),
    );
  };

  const lockDownNetwork = () => {
    setRules((prev) =>
      prev.filter(
        (rule) =>
          !(
            rule.sourceGroup === "everyone" &&
            rule.targetGroup === "everyone" &&
            rule.permission === "allow"
          ),
      ),
    );
  };

  const restoreOpenNetwork = () => {
    if (isNetworkOpen) {
      return;
    }

    setRules((prev) => [{ id: Date.now().toString(), ...OPEN_RULE }, ...prev]);
  };

  return (
    <div className={cn("container max-w-6xl", showHeader ? "py-10" : "py-0")}>
      {showHeader ? (
        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">Access Control</h1>
            <Badge variant={isNetworkOpen ? "destructive" : "secondary"}>
              {isNetworkOpen ? "Open network detected" : "Restricted network"}
            </Badge>
          </div>
          <p className="max-w-3xl text-base text-muted-foreground">
            Keep ACL changes fast and safe. Start with recipes, then use advanced rules only when needed.
          </p>
        </div>
      ) : (
        <div className="mb-6 flex justify-end">
          <Badge variant={isNetworkOpen ? "destructive" : "secondary"}>
            {isNetworkOpen ? "Open network detected" : "Restricted network"}
          </Badge>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AclTab)}
        className="space-y-6"
      >
        {applyRecipe.error && (
          <Banner variant="danger">
            Failed to apply policy recipe: {(applyRecipe.error as Error).message}
          </Banner>
        )}
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex min-h-28 items-center justify-between p-6">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Network posture</p>
                  <p className="text-lg font-semibold">{isNetworkOpen ? "Open" : "Restricted"}</p>
                </div>
                {isNetworkOpen ? (
                  <ShieldAlert className="h-8 w-8 text-yellow-500" />
                ) : (
                  <Shield className="h-8 w-8 text-green-500" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex min-h-28 items-center justify-between p-6">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Groups</p>
                  <p className="text-lg font-semibold">{groups.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex min-h-28 items-center justify-between p-6">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Rules</p>
                  <p className="text-lg font-semibold">{rules.length}</p>
                </div>
                <Lock className="h-8 w-8 text-indigo-500" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex min-h-28 items-center justify-between p-6">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Known devices</p>
                  <p className="text-lg font-semibold">{totalDevices}</p>
                </div>
                <Globe className="h-8 w-8 text-cyan-500" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Posture</CardTitle>
              <CardDescription>
                One-click policy recipes for incident response.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                {isNetworkOpen
                  ? "Default everyone-to-everyone allow is active."
                  : "No default open rule is active."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={restoreOpenNetwork} disabled={isNetworkOpen}>
                  Restore Open Default
                </Button>
                <Button variant="destructive" onClick={lockDownNetwork} disabled={!isNetworkOpen}>
                  Lock Down Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Policy Recipes</CardTitle>
                <CardDescription>Apply safe defaults first, then fine-tune in Rules.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button
                  variant="destructive"
                  className="justify-start"
                  onClick={() => applyRecipe.mutate("lockdown")}
                  disabled={applyRecipe.isPending}
                >
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Recipe: Lock Down Network
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start"
                  onClick={() => applyRecipe.mutate("open-default")}
                  disabled={applyRecipe.isPending}
                >
                  <Unlock className="mr-2 h-4 w-4" />
                  Recipe: Restore Open Default
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => applyRecipe.mutate("dev-to-staging")}
                  disabled={applyRecipe.isPending}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Recipe: Dev to Staging Access
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Rules</CardTitle>
                <CardDescription>Policy state after the latest recipe/actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rules.slice(-3).reverse().map((rule) => (
                  <div key={rule.id} className="rounded-md border bg-muted/30 p-4 text-sm">
                    <span className="font-medium">{getGroupName(rule.sourceGroup)}</span>
                    <ArrowRight className="mx-2 inline h-3 w-3" />
                    <span className="font-medium">{getGroupName(rule.targetGroup)}</span>
                    <Badge
                      variant={rule.permission === "allow" ? "secondary" : "destructive"}
                      className="ml-2"
                    >
                      {rule.permission}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {applyRecipe.data?.applied && (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                {applyRecipe.data.applied}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>New Group</CardTitle>
                <CardDescription>Create once, then reuse in rules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="group-name">Name</Label>
                  <Input
                    id="group-name"
                    placeholder="Production Servers"
                    value={newGroupName}
                    onChange={(event) => setNewGroupName(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="group-description">Description</Label>
                  <Input
                    id="group-description"
                    placeholder="Critical backend infrastructure"
                    value={newGroupDescription}
                    onChange={(event) => setNewGroupDescription(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="group-icon">Icon</Label>
                  <Select value={newGroupIcon} onValueChange={(value) => setNewGroupIcon(value as IconKey)}>
                    <SelectTrigger id="group-icon">
                      <SelectValue placeholder="Pick icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUP_ICON_OPTIONS.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                          <span className="inline-flex items-center gap-2">
                            {renderIcon(option.key)}
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={addGroup}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Groups</CardTitle>
                <CardDescription>Deleting a group also removes rules that reference it.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">{renderIcon(group.icon, "h-5 w-5")}</div>
                      <div className="space-y-0.5">
                        <p className="font-medium">{group.name}</p>
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{group.deviceCount || 0} devices</Badge>
                      <Button variant="ghost" size="icon" onClick={() => removeGroup(group.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>New Rule</CardTitle>
                <CardDescription>
                  Choose source, target, and permission, then save.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="source-group">Source</Label>
                  <Select value={sourceGroup} onValueChange={setSourceGroup}>
                    <SelectTrigger id="source-group">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupOptions.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          <span className="inline-flex items-center gap-2">
                            {renderIcon(group.icon)}
                            {group.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="target-group">Target</Label>
                  <Select value={targetGroup} onValueChange={setTargetGroup}>
                    <SelectTrigger id="target-group">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupOptions.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          <span className="inline-flex items-center gap-2">
                            {renderIcon(group.icon)}
                            {group.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="permission">Permission</Label>
                  <Select
                    value={permission}
                    onValueChange={(value: "allow" | "deny") => setPermission(value)}
                  >
                    <SelectTrigger id="permission">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="deny">Deny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rule-description">Description (optional)</Label>
                  <Input
                    id="rule-description"
                    placeholder="Temporary ACL for incident response"
                    value={ruleDescription}
                    onChange={(event) => setRuleDescription(event.target.value)}
                  />
                </div>

                <div className="rounded-md border bg-muted/30 p-4 text-sm">
                  <span className="font-medium">{getGroupName(sourceGroup)}</span>
                  <ArrowRight className="mx-2 inline h-3 w-3" />
                  <span className="font-medium">{getGroupName(targetGroup)}</span>
                  <Badge
                    variant={permission === "allow" ? "secondary" : "destructive"}
                    className="ml-2"
                  >
                    {permission}
                  </Badge>
                </div>

                <Button className="w-full" onClick={addRule}>
                  <Plus className="mr-2 h-4 w-4" />
                  Save Rule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Rules</CardTitle>
                <CardDescription>Keep this list explicit for faster troubleshooting.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rules.map((rule) => {
                  const isDefaultOpenRule =
                    rule.sourceGroup === "everyone" &&
                    rule.targetGroup === "everyone" &&
                    rule.permission === "allow";

                  return (
                    <div
                      key={rule.id}
                      className={cn(
                        "flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between",
                        isDefaultOpenRule && "border-yellow-500/40 bg-yellow-500/5",
                      )}
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{renderIcon(getGroupIcon(rule.sourceGroup))}</span>
                          <span className="font-medium">{getGroupName(rule.sourceGroup)}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{renderIcon(getGroupIcon(rule.targetGroup))}</span>
                          <span className="font-medium">{getGroupName(rule.targetGroup)}</span>
                          <Badge variant={rule.permission === "allow" ? "secondary" : "destructive"}>
                            {rule.permission === "allow" ? (
                              <>
                                <Unlock className="mr-1 h-3 w-3" />
                                Allow
                              </>
                            ) : (
                              <>
                                <Lock className="mr-1 h-3 w-3" />
                                Deny
                              </>
                            )}
                          </Badge>
                        </div>
                        {rule.description && (
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeRule(rule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
