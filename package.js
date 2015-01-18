Package.describe({
  summary: "Reaction Braintree - Braintree Payment Module for Reaction commerce",
  name: "reactioncommerce:reaction-braintree",
  version: "1.0.0",
  git: "https://github.com/reactioncommerce/reaction-braintree.git"
});

Npm.depends({'braintree': '1.15.0'});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform@1.2.1");
  api.use("coffeescript");
  api.use("less");
  api.use("reactioncommerce:core@0.2.2");

  api.add_files("common/collections.coffee",["client","server"]);
  api.add_files("common/routing.coffee",["client","server"]);
  api.add_files("common/register.coffee",["client","server"]);
  api.add_files("server/braintree.coffee",["server"]);
  api.add_files([
    "client/templates/braintree.html",
    "client/templates/braintree.coffee",
    "client/templates/braintreePaymentForm/braintreePaymentForm.html",
    "client/templates/braintreePaymentForm/braintreePaymentForm.coffee"
  ], ["client"]);
});
