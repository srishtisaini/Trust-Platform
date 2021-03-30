App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("HotelReview.json", function(hotelreview) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.HotelReview = TruffleContract(hotelreview);
      // Connect provider to interact with contract
      App.contracts.HotelReview.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.HotelReview.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.reviewEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var hotelInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.HotelReview.deployed().then(function(instance) {
      hotelInstance = instance;
      return hotelInstance.hotelsCount();
    }).then(function(hotelsCount) {
      var hotelResult = $("#hotelResult");
      hotelResult.empty();

      var hotelSelect = $("#hotelSelect");
      hotelSelect.empty();

      var idToName = {1 : "The Leela", 2:"IBIS", 3:"The Lalit", 4:"Lemontree", 5:"Radisson Blu"};

      for (var i = 1; i <= hotelsCount; i++) {
        hotelInstance.hotels(i).then(function(hotel) {
        console.log(hotel);
         var id = hotel[0];
          var reviewCount = hotel[1];
          var reviewSum = hotel[2];

          var rat = 0;
          if(reviewCount != 0) {
           rat =  (reviewSum/reviewCount)
          }

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + idToName[id] + "</td><td>" + rat + "</td></tr>"
          hotelResult.append(candidateTemplate);
          

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + idToName[id] + "</ option>"
          hotelSelect.append(candidateOption);
          console.log(candidateTemplate)
        });
      }
      return hotelInstance.users(App.account);
    }).then(function(hasVoted) {
      
       
      
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  review: function() {
    var hotelId = $('#hotelSelect').val();
    


   /* var e = document.getElementById ("hotelSelect");
var hotelId = e.options [e.selectedIndex] .value; */

//alert(hotelId);

    var rating = $('input[name=rating]:checked').val();

    //alert(rating);
    
    App.contracts.HotelReview.deployed().then(function(instance) {
    
      var res =  instance.review(hotelId,rating, { from: App.account });
      //alert("333"+res);
      return res;
    }).then(function(result) {
    
    //alert("444"+result);
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.log('error')
      console.error(err);
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});