# quarkus-bot

> A GitHub App built with [Probot](https://github.com/probot/probot) that helps to maintain the Quarkus project.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```
## Setting up your env

To set up your environment, copy `.env.example` to `.env` and adjust the values.

In production, `DRY_RUN` should be either false or not defined.

## Actions

### Check pull request editorial rules

This actions checks that the title of a pull request respects some editorial rules:

### Triage issues

Based on the `.github/quarkus-bot.yml` file, this rule affects labels to issues and also pings the appropriate people.

Syntax of the `.github/quarkus-bot.yml` file is as follows:

```yaml
---
triage:
  rules:
    - labels: [area/amazon-lambda]
      titleBody: "lambda"
      notify: [patriot1burke, matejvasek]
      directories:
        - extensions/amazon-lambda
        - integration-tests/amazon-lambda
    - labels: [area/persistence]
      titleBody: "db2"
      notify: [aguibert]
      directories:
        - extensions/reactive-db2-client/
        - extensions/jdbc/jdbc-db2/
```

For issues, each rule can be triggered by:

* `title` - if the title matches this regular expression (case insensitively), trigger the rule
* `body` - if the body (i.e. description) matches this regular expression (case insensitively), trigger the rule
* `titleBody` - if either the title or the body (i.e. description) matches this regular expression (case insensitively), trigger the rule
* `expression` - allows to write a Javascript expression testing `title`, `body` or `titleBody`. Be careful when writing expressions, better ping `@gsmet` in the pull request when creating/updating an expression.

The regular expressions are included in a Javascript `RegExp` object so special characters must be escaped.
Typically, for a word boundary, you have to use `\\b`.

If the rule is triggered, the following actions will be executed:

* `notify` - will create a comment pinging the users listed in the array
* `labels` - will add the labels to the issue

### Triage pull requests

The pull requests triage action uses the same configuration file as the issues triage action.

There are a few differences though as it doesn't behave in the exact same way.

For pull requests, each rule can be triggered by:

* `directories` - if any file in the commits of the pull requests match, trigger the rule. This is not a regexp (it uses `startsWith`) but glob type expression are supported too `extensions/test/**`.

If the rule is triggered, the following action will be executed:

* `labels` - will add the labels to the issue
* `notify` - will create a comment pinging the users listed in the array **only if `notifyInPullRequest` is true**

### Affect milestones

When a pull request is merged, if it targets the `master` branch, it affects the milestone ending with ` - master` to the pull request and the issues resolved by the pull request (e.g. `Fixes #1234`).

It only affects the milestone is no milestone has been affected prior to the merge.
If the milestone cannot be affected, we add a comment to the pull request indicating the items for which we haven't affected the milestone.

### Mark closed pull requests as invalid

If a pull request is closed without being merged, we automatically add the `triage/invalid` label to the pull request.

## Contributing

If you have suggestions for how quarkus-bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2020 Guillaume Smet <guillaume.smet@gmail.com>
