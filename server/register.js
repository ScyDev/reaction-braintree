/* eslint camelcase: 0 */

ReactionCore.registerPackage({
  label: "BrainTree",
  name: "reaction-braintree", // usually same as meteor package
  autoEnable: true, // auto-enable in dashboard
  settings: // private package settings config (blackbox)
  {
    mode: false,
    merchant_id: "",
    public_key: "",
    private_key: ""
  },
  registry: [
    // all options except route and template
    // are used to describe the
    // dashboard "app card".
    {
      provides: "dashboard",
      label: "Braintree",
      description: "Braintree payments",
      icon: "fa fa-credit-card",
      cycle: "2",
      container: "dashboard",
      template: "braintree"
    },

    {
      label: "Braintree Settings",
      route: "dashboard/braintree",
      provides: "settings",
      container: "dashboard",
      template: "braintreeSettings"
    },
    // configures template for checkout
    // paymentMethod dynamic template
    {
      template: "braintreePaymentForm",
      provides: "paymentMethod"
    }
  ],
  // array of permission objects
  permissions: [
    {
      label: "Braintree",
      permission: "dashboard/payments",
      group: "Shop Settings"
    }
  ]
});
