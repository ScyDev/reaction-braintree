Package.describe({
  summary: "Reaction Braintree - Braintree payments for Reaction Commerce",
  name: "reactioncommerce:reaction-braintree",
  version: "1.1.0",
  git: "https://github.com/reactioncommerce/reaction-braintree.git"
});

Npm.depends({'braintree': '1.15.0'});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform@1.2.1");
  api.use("coffeescript");
  api.use("less");
  api.use("reactioncommerce:core@0.4.1");

  api.addFiles("server/register.coffee",["server"]); // register as a reaction package
  api.addFiles("server/braintree.coffee",["server"]);

  api.addFiles([
    "common/collections.coffee",
    "common/routing.coffee",
    "lib/braintree.coffee"
  ],["client","server"]);

  api.addFiles([
    "client/templates/braintree.html",
    "client/templates/braintree.less",
    "client/templates/braintree.coffee",
    "client/templates/cart/checkout/payment/methods/braintree/braintree.html",
    "client/templates/cart/checkout/payment/methods/braintree/braintree.less",
    "client/templates/cart/checkout/payment/methods/braintree/braintree.coffee"
  ],
  ["client"]);

});
