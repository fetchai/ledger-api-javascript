 const prom = fetchai.Bootstrap.server_from_name('betanet')
    prom.then(function(res){
        window.SERVER = res
    })
