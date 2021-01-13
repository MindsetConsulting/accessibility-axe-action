# accessibility-axe-action
Github action for running axe accessibility tests

## Inputs

### `project-path`

### `config-file-location`

Defaults to `ui5.yaml`. The action will run `ui5 build dev --all` with this config file in the project path.

## Outputs

### `axe-results-location`

Location of the Axe log file.

## Example usage

uses: actions/accessibility-axe-action@v1
with:
  project-path: 'my_project'
  config-file-location: '