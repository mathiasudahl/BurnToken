App = {

    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokenSold: 0,
    tokensAvailable: 750000,

    init: function(){
        console.log("App init OK");
        return App.initWeb3();
    },

    initWeb3: function () {
        if(typeof web3 !== 'undefined'){
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }

        return App.initContracts();
    },

    initContracts: function () {
        $.getJSON("BurnTokenSale.json", function(burnTokenSale){
            App.contracts.BurnTokenSale = TruffleContract(burnTokenSale);
            App.contracts.BurnTokenSale.setProvider(App.web3Provider);
            App.contracts.BurnTokenSale.deployed().then(function(burnTokenSale){
                console.log("Burn token sale address", burnTokenSale.address);
            });
        }).done(function () {
            $.getJSON("BurnToken.json", function(burnToken){
                App.contracts.BurnToken = TruffleContract(burnToken);
                App.contracts.BurnToken.setProvider(App.web3Provider);
                App.contracts.BurnToken.deployed().then(function(burnToken){
                    console.log("Burn token address", burnToken.address);
                    App.listenForEvents();
                    return App.render();
                });
            });
        });
    },

    listenForEvents: function (){
        App.contracts.BurnTokenSale.deployed().then(function(instance){
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest',

            }).watch(function(error, ecent){
                console.log("event tr", event);
                App.render();
            });
        });
    },

    render: function() {
        if(App.loading){
            return;
        }
        App.loading = true;

        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();        

        //Load account data
        web3.eth.getCoinbase(function(err, account){
            if(err === null){
                App.account = account;
                $("#accountAddress").html("Your Account:" + account);
            }
        });

        App.contracts.BurnTokenSale.deployed().then(function (instance) {
            burnTokenSaleInstance = instance;
            return burnTokenSaleInstance.tokenPrice();
        }).then(function (tokenPrice) {
            App.tokenPrice = tokenPrice;
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
            return burnTokenSaleInstance.tokensSold();
        }).then(function(tokenSold){
            App.tokenSold = tokenSold.toNumber();
            $('.tokens-sold').html(App.tokenSold);
            $('.tokens-available').html(App.tokensAvailable);

            App.contracts.BurnToken.deployed().then(function(instance){
                burnTokenInstance = instance;
                return burnTokenInstance.balanceOf(App.account);
            }).then(function(balance){
                $('.burn-balance').html(balance.toNumber());
            
                App.loading = false;
                loader.hide();
                content.show();
            });
        });
    },

     buyTokens: function(){
         $('#content').hide();
         $('#loader').show();

         var numberOfTokens = $('#numberOfTokens').val();

         App.contracts.BurnTokenSale.deployed().then(function(instance){
             return instance.buyTokens(numberOfTokens, {
                 from: App.account,
                 value: numberOfTokens * App.tokenPrice,
                 gas: 5000000
             });
         }).then(function(result){
            console.log("Tokens bought...");
            //wait for sell event
         });
    }
}

$(function() {
    $(window).on('load', function() {
        App.init();
    })
});