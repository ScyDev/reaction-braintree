Package.describe({
  summary: "Reaction Braintree - Braintree payments for Reaction Commerce",
  name: "reactioncommerce:reaction-braintree",
  version: "1.5.0",
  git: "https://github.com/reactioncommerce/reaction-braintree.git"
});

Npm.depends({'braintree': '1.29.0'});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@1.2');

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
  api.use("coffeescript");

  // use reaction commerce
  api.use("reactioncommerce:core@0.8.0");

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
