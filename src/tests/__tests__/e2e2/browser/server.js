console.log("FFFF ");
setTimeout(function(){
const prom = result.Bootstrap.server_from_name('alphanet');
prom.then(function(r){
    console.log("help!!!  please:: " + r);
    window.SERVER = r;
})
  // const [uri, port] = result.Bootstrap.server_from_name('betanet')
    //result.Bootstrap.server_from_name('betanet')
     console.log("it WWW is node::QQQ ");
}, 6000)
