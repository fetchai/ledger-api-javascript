let PASSWORD = "qwerty123456789!!£$%^&";

const identity1 = new fetchai.Entity();
const pk1 = identity1.private_key_hex()
    identity1._to_json_object(PASSWORD).then(function(json_obj){
        fetchai.Entity._from_json_object(json_obj, PASSWORD).then(
        function(resulting_entity){
        const pk2 = resulting_entity.private_key_hex()
           window.PASSWORD_ENCRYPTION = Boolean(pk1 === pk2)
        })
})






