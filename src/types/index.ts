export interface Environment {
  id: string
  name: string
  env_type: string
  variables: Record<string, string>
  add_to_path: string[]
}

export interface ToolFlag {
  flag: string
  label: string
  dangerous: boolean
  has_value: boolean
}

export interface Tool {
  id: string
  name: string
  path: string
  available_flags: ToolFlag[]
}

export interface GroupInfo {
  name: string
  count: number
}

export interface Profile {
  id: string
  name: string
  project_path: string
  environment_ids: string[]
  tool_id: string
  enabled_flags: string[]
  extra_variables: Record<string, string>
  group: string
}
