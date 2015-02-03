Package.describe({
  summary: "Reaction Braintree - Braintree payments for Reaction Commerce",
  name: "reactioncommerce:reaction-braintree",
  version: "0.1.0",
  git: "https://github.com/reactioncommerce/reaction-braintree.git"
});

Npm.depends({'braintree': '1.15.0'});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform@1.2.1");
  api.use("coffeescript");
  api.use("less");
  api.use("reactioncommerce:core@0.2.2");

  api.add_files([
    "common/register.coffee",
    "common/collections.coffee",
    "lib/braintree.coffee"
  ],["client","server"]);
  api.add_files("server/braintree.coffee",["server"]);
  api.add_files([
    "client/routing.coffee",
    "client/templates/braintree.html",
    "client/templates/braintree.less",
    "client/templates/braintree.coffee",
    "client/templates/cart/checkout/payment/methods/braintree/braintree.html",
    "client/templates/cart/checkout/payment/methods/braintree/braintree.less",
    "client/templates/cart/checkout/payment/methods/braintree/braintree.coffee"
  ],
  ["client"]);
  
});
