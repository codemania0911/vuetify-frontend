# CDT Web Frontend.


## Login Information
* User name: admin
* Password: OPA-90Noelle2019!


## Adding Dependencies

When adding dependencies, use the command `yarn add package-name`.
This will add the package to the `package.json` file, and will trigger a `yarn install` which will update the `yarn.lock` file.
Be sure to commit the changes to the `package.json` file.


## Branching

We follow [git-flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow):

* `development` is our current working branch.
* `master` is the current production branch.
* To contribute, make a `fix/my-fix` or `feature/my-feature` branch off `development` and make a PR on git when you're ready to merge
* To release, make a `release/X.X.X` branch off `development`
* To introduce a hotfix, make a `hotfix/my-hotfix` branch off `master` branch and make 2 PRs on git with `master` and `development` branches
as targets. Then, tag the new commit in `master` called `vX.X.X+1` (`vX.X.X` - is the latest release version)


## Hotfix Workflow

* Checkout to `master` branch:
  - git checkout `master`
  - git pull origin `master`
* Create `hotfix/XXXX` from `master`:
  - git checkout -b `hotfix/XXXX`
* Make and commit changes, push `hotfix/XXXX` branch:
  - git push origin `hotfix/XXXX`
* Create 3 PRs: to `develop`, `release/X.Y.0`, and `master`
* After PR merge to `master` checkout to `master` and create a tag `vX.Y.(Z + 1)`:
  - git checkout `master`
  - git pull origin `master`
  - git tag `vX.Y.(Z + 1)`
  - git push origin `vX.Y.(Z + 1)`


## Pull Requests and Naming

Unified naming helps to quickly find all related information about the developer's task

* Not ready. Will be come soon.


## Comments

Comments should always have the following format:

* `// NOTE: Explain, describe, add clarifications to your code`
* `// TODO: Instruct others what else should be done or how to scale the following code`
* `// FIXME: Notify others that following code is a temporary hack and why you have done it this way`


## Tests Development

* `yarn dev`- Wait for development server to start
* `yarn test:e2e` - Run tests locally
