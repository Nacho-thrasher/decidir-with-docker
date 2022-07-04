const { DECIDIR_PUBLIC_KEY }  = process.env;
const object = (obj) => {
    return {	
        "card_number":  obj.card_number,
        "card_expiration_month": obj.card_expiration_month,
        "card_expiration_year": obj.card_expiration_year,
        "security_code": obj.security_code,
        "card_holder_name": obj.card_holder_name,
        "card_holder_identification": {
            "type": obj.type,
            "number":   obj.number,        
        }
    };
}
module.exports = {
    object
}
