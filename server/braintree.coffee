Braintree = Npm.require('braintree')
Fiber = Npm.require("fibers")
Future = Npm.require("fibers/future")

settings = Packages.findOne(name: "reaction-braintree").settings

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

        ### Error handling Snippet from braintree docs
        throw err if err
        if result.success
          console.log "Success. Transaction ID: " + result.transaction.id
        else
          console.log result.message
        return
        ###