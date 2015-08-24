Package.describe({
  summary: "Reaction Braintree - Braintree payments for Reaction Commerce",
  name: "reactioncommerce:reaction-braintree",
  version: "1.3.0",
  git: "https://github.com/reactioncommerce/reaction-braintree.git"
});

Npm.depends({'braintree': '1.27.0'});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform@1.2.2");
  api.use("less");
  api.use("reactioncommerce:core@0.6.1");

  api.addFiles("server/register.js",["server"]); // register as a reaction package
  api.addFiles("server/braintree.js",["server"]);

  api.addFiles([
    "common/collections.js",
    "common/routing.js",
    "lib/braintree.js"
  ],["client","server"]);

  api.addFiles([
    "client/templates/braintree.html",
    "client/templates/braintree.less",
    "client/templates/braintree.js",
    "client/templates/cart/checkout/payment/methods/braintree/braintree.html",
    "client/templates/cart/checkout/payment/methods/braintree/braintree.less",
    "client/templates/cart/checkout/payment/methods/braintree/braintree.js"
  ],
  ["client"]);

});
