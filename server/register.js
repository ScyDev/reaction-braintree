ReactionCore.registerPackage({
  name: 'reaction-braintree',
  autoEnable: false,
  settings: {
    mode: false,
    merchant_id: "",
    public_key: "",
    private_key: ""
  },
  registry: [
    {
      provides: 'dashboard',
      label: 'Braintree',
      description: "Braintree Payment for Reaction Commerce",
      icon: 'fa fa-credit-card',
      cycle: '3',
      container: 'dashboard'
    }, {
      route: 'braintree',
      provides: 'settings',
      container: 'dashboard'
    }, {
      template: 'braintreePaymentForm',
      provides: 'paymentMethod'
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
