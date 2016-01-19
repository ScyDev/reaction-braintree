Package.describe({
  summary: "Reaction Braintree - Braintree payments for Reaction Commerce",
  name: "reactioncommerce:reaction-braintree",
  version: "1.5.1",
  git: "https://github.com/reactioncommerce/reaction-braintree.git"
});

Npm.depends({braintree: "1.35.0"});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2.1");

  // meteor base packages
  api.use("standard-minifiers");
  api.use("mobile-experience");
  api.use("meteor-base");
  api.use("mongo");
  api.use("blaze-html-templates");
  api.use("session");
  api.use("jquery");
  api.use("tracker");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("spacebars");
  api.use("check");

  // meteor add-on packages
  api.use("less");

  // use reaction commerce
  api.use("reactioncommerce:core@0.10.1");

  api.addFiles("server/register.js", ["server"]); // register as a reaction package
  api.addFiles("server/braintree.js", ["server"]);

  api.addFiles([
    "common/collections.js",
    "common/routing.js",
    "lib/braintree.js"
  ], ["client", "server"]);

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
