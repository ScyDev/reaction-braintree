ReactionCore.registerPackage({
  label: "Brantree",
  name: "reaction-braintree",
  icon: "fa fa-credit-card",
  autoEnable: false,
  settings: {
    mode: false,
    merchant_id: "",
    public_key: "",
    private_key: ""
  },
  registry: [
    {
      provides: "dashboard",
      label: "Braintree",
      description: "Braintree Payment for Reaction Commerce",
      route: "dashboard/braintree",
      icon: "fa fa-credit-card",
      cycle: "3",
      container: "dashboard"
    }, {
      label: "Braintree Settings",
      route: "dashboard/braintree",
      provides: "settings",
      container: "dashboard",
      template: "braintreeSettings"
    }, {
      template: "braintreePaymentForm",
      provides: "paymentMethod"
    }
  ],
  permissions: [
    {
      label: "Braintree",
      permission: "dashboard/payments",
      group: "Shop Settings"
    }
  ]
});
