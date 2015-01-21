Braintree = Npm.require('braintree')
Fiber = Npm.require("fibers")
Future = Npm.require("fibers/future")

braintreePackage = ReactionCore.Collections.Packages.findOne(name: "reaction-braintree")

if braintreePackage?.settings
  ReactionCore.Events.trace {name: "reactioncommerce:reaction-braintree", settings: braintreePackage}
  settings = braintreePackage.settings
  gateway = Braintree.connect(
    environment: Braintree.Environment.Sandbox
    merchantId: settings.merchant_id
    publicKey: settings.public_key
    privateKey: settings.private_key
  )

Meteor.methods
  braintreeSubmit: (cardData, amount) ->
    fut = new Future()
    @unblock()

    gateway.transaction.sale
      amount: amount
      creditCard:
        number: cardData.number
        expirationMonth: cardData.expirationMonth
        expirationYear: cardData.expirationYear
        cvv: cardData.cvv
      , (err, payment) ->
        if err
          fut.return
            saved: false
            error: err
        else if payment.success
          fut.return
            saved: true
            payment: payment
        else
          console.log result.message
        return

    fut.wait()
