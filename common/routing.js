Router.map(function() {
  return this.route("dashboard/braintree", {
    controller: ShopAdminController,
    path: "dashboard/braintree",
    template: "braintree",
    waitOn: function() {
      return ReactionCore.Subscriptions.Packages;
    }
  });
});
