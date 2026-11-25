# repo-profile.md  (writer: delivery-intake; sole authority, D22)
profile_version: 1
measured_utc: 2026-11-25T06:40:00Z
project_root: FILL_IN_BEFORE_DISPATCH
worktree_base: /Users/xavier/delivery/worktrees
default_branch: master
clones: [/Users/xavier/projects/funglr]
linked_profiles: []
repo: {name: funglr, type: static AngularJS 1.3 single-page app (no server), package_scope: none, consumer_repos: [], registry: none}
commands:
  install: npm ci
  install_rebuild_allowlist: []
  lint: npm run lint
  typecheck: none
  test: npm test
  build: npm run build
  pack: none
  clean: none
  release: none
  publish: none
gates:
  command: npm run lint && npm test && npm run build
  parallel: 4
  min_free_kb: 5000000
  runner_slots: 4
node: {prefix_cmd: true}
desk_commands:
  - 'deps | build | . | 900 | - | npm ci --ignore-scripts'
pr:
  author_identity: the operator's own GitHub login through the desk
  approval_rule: gate pass = merge, no human approval
  template_path: none
  label_rules: none
  commit_pattern: FILL_IN_BEFORE_DISPATCH
merge_method: merge
merge_route: pr
merge_reach: nothing, no CI and no deploy; a merge only changes master on GitHub
version_bump_rule: none
plan_plane_pr: none
ci:
  system: none
  status_read_skill: none
  required_checks: []
  min_push_spacing_s: 30
  max_open_pr_pipelines: 20
merge_pipeline: {stages: []}
secrets:
  pattern_file: /Users/xavier/projects/agent-hq/tools/delivery/default-secret-patterns.txt
  retrieval_env_vars: []
  hosts: []
zephyr:
  read_ops: []
  execute_tool: none
test_management_tool: none
tracker: none
release_tags:
  used: "no"
review_profile:
  mandatory_seats: []
  blocking_rules: []
  coverage_thresholds: none
sensitive_paths: ['^\.github/', '^package(-lock)?\.json$']
ports: {lane_base: 38100}
lane_profile:
  lanes_max: FILL_IN_BEFORE_DISPATCH
  dev_server_cmd: FILL_IN_BEFORE_DISPATCH
lanes: []
e2e:
  harness: none
durations:
  pr_review_min: 10
  ci_round_min: 5
  unit_median_min: 10
