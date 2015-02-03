reaction-braintree
=============

Meteor/Reaction Package for Paypal integration, installed by default with core packages.

This is a prototype module -> pull requests are celebrated, feedback encouraged.

International user? See: https://github.com/reactioncommerce/reaction/issues/96

### Usage
```console
meteor add reactioncommerce:reaction-braintree
```

### Configuration
In settings/settings.json file, or via dashboard configuration:
```json
"braintree": {
  "mode:" false, //true is live
  "merchant_id": "<your braintree merchant id>",
  "public_key": "<your braintree public key>",
  "private_key": "<your braintree private key>"
}
```

This overrides the dummy fixture data in common/collections.coffee

```coffeescript
Meteor.settings.braintree =
  mode: false
  merchant_id: ""
  public_key: ""
  private_key: ""
  ```

  #### Use

  Format is `Meteor.Braintree.*transaction_type*({ {/*card data*/}, {/*transaction data*/}, function(err, res){...})`

  ```javascript
  Meteor.Braintree.authorize({
    name: 'Buster Bluth',
    number: '4111111111111111',
    cvv2: '123',
    expire_year: '2015',
    expire_month: '01'
  },
{
  total: '100.10',
  currency: 'USD'
},
function(error, results){
  if(error)
  //Deal with Error
  else
  //results contains boolean for saved
  // and a payment object with information about the transaction
  });
  ```

  For information on the **transaction** object returned see [Braintrees's Transaction Response Option Documentation](https://developers.braintreepayments.com/javascript+node/reference/response/transaction)
