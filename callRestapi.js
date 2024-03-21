var url = "http://localhost:3300/Api/ines";

function agregarINE() {
    const ineUrl = $('#ineUrl').val();
    if (ineUrl) {
        getOcrTextjQueryLocal(ineUrl); // Llama a la función getOcrTextjQueryLocal con la URL de la INE
    } else {
        console.error("Debe proporcionar una URL de INE.");
    }
}


function postUser(user) {
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        success: function(data){
            console.log(data);
            $("#result").html(JSON.stringify(data.user));
        },
        data: JSON.stringify(user)
    });
}

function getOcrTextjQueryLocal(imageUrl) {
    $.ajax({
        url: `https://ocr-extract-text.p.rapidapi.com/ocr?url=${encodeURIComponent(imageUrl)}`,
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '8daf878b9fmsh814409db082a5eep1e3fbfjsnd759a2fc4af4',
            'X-RapidAPI-Host': 'ocr-extract-text.p.rapidapi.com'
        },
        success: function (data) {
            console.log(data);
            mostrarInformacion(data);
            if (data.status === true) {
                const user = mostrarInformacion(data);
                user.url = imageUrl;
                postUser(user); 
            }
        },
        error: function (error) {
            console.error('Error:', error);
        }
    });
}


function mostrarInformacion(jsonData) {
    if (jsonData.status === true) {
        const text = jsonData.text;

        const nombreMatch = text.match(/NOMBRE\n([\s\S]+?)\nDOMICILIO/);
        const name = nombreMatch ? nombreMatch[1].replace(/\n/g, ' ').trim() : '';

        const domicilioMatch = text.match(/DOMICILIO\n([\s\S]+?)\n(?:CLAVE DE ELECTOR|CURP|FECHA DE NACIMIENTO)/);
        const domicilio = domicilioMatch ? domicilioMatch[1].trim() : '';

        const domicilioParts = domicilio.split('\n');
        const calle = domicilioParts[0];
        const addressPart = domicilioParts[domicilioParts.length - 2];
        const addressComponents = addressPart.split(' ');
        
    
        const cpIndex = addressComponents.findIndex(part => /^\d{5}$/.test(part)); // Buscar el componente que coincide con el formato de código postal
        const coloniaCiudadParts = addressComponents.slice(1, cpIndex).join(' ').split(',');

        const colonia = coloniaCiudadParts[0].trim();
        
        const ciudadMatches = domicilioParts[2].match(/(.+?),/);
        const ciudad = ciudadMatches ? ciudadMatches[1].trim() : '';

        const cp = addressComponents[cpIndex];
        
        const estadoMatch = domicilioParts[domicilioParts.length - 1].match(/,\s*(\w+)\.$/);
        const estado = estadoMatch ? estadoMatch[1] : '';

        const curpMatch = text.match(/CURP (.+?)\nESTADO/);
        const curp = curpMatch ? curpMatch[1].trim() : '';

        console.log(text)
        console.log('curp', curp);

        const fechaNacimientoMatch = text.match(/FECHA DE NACIMIENTO\n(.+?)\nSEXO/);
        const fechaNacimiento = fechaNacimientoMatch ? fechaNacimientoMatch[1].trim() : '';

        const sexoMatch = text.match(/SEXO\s*(\w)/);
        const sexo = sexoMatch ? sexoMatch[1]: ''; 

       return { name, calle, colonia, cp, ciudad, estado, curp, fechaNacimiento, sexo };
       
    } else {
        console.error("La respuesta del servidor indica un estado falso.");
        return null;
    }
}

function getINEs() {
    console.log(url);

    $.getJSON(url, function(json) {
        console.log(json);
        
        let arrINEs = json.ines;
        let htmlTableINEs = "<table border='1'>";

        // Encabezados de la tabla
        htmlTableINEs += "<tr>" +
            "<th>ID</th>" +
            "<th>Nombre</th>" +
            "<th>Calle</th>" +
            "<th>Colonia</th>" +
            "<th>Código Postal</th>" +
            "<th>Ciudad</th>" +
            "<th>Estado</th>" +
 //           "<th>CURP</th>" +
            "<th>Fecha de Nacimiento</th>" +
            "<th>Sexo</th>" +
            "<th>URL</th>" +
            "</tr>";

        // Datos de las INEs
        arrINEs.forEach(function(ine){
            htmlTableINEs += "<tr>" +
                "<td>" + ine.id + "</td>" +
                "<td>" + ine.name + "</td>" +
                "<td>" + ine.calle + "</td>" +
                "<td>" + ine.colonia + "</td>" +
                "<td>" + ine.cp + "</td>" +
                "<td>" + ine.ciudad + "</td>" +
                "<td>" + ine.estado + "</td>" +
   //             "<td>" + ine.curp + "</td>" +
                "<td>" + ine.fechaNacimiento + "</td>" +
                "<td>" + ine.sexo + "</td>" +
                "<td>" + ine.url + "</td>" +
                "</tr>";
        });

        htmlTableINEs += "</table>";
        console.log(htmlTableINEs);
        $("#result").html(htmlTableINEs);
    });
}




const jsonDt = {
    status: true,
    text:  "UNIDOS\nESTADOS\nMEXICANOS\nM\u00c9XICO\nINSTITUTO NACIONAL ELECTORAL\nCREDENCIAL PARA VOTAR\nNOMBRE\nVERA\nFUENTES\nJORGE ALFREDO\nDOMICILIO\nC NORTE 7 142\nCOL CENTRO 94300\nORIZABA, VER.\nCLAVE DE ELECTOR VRFNJR95081130H900\nCURP VEFJ950811HVZRNR01\nESTADO 30\nLOCALIDAD 0001\nFECHA DE NACIMIENTO\n11\/08\/1995\nSEXO H\nA\u00d1O DE REGISTRO 2013 01\nMUNICIPIO 119\nSECCI\u00d3N 2731\nEMISI\u00d3N 2014 VIGENCIA 2024",
    detectedLanguages: [
        { languageCode: "es", confidence: 0.8189754 },
        { languageCode: "pt", confidence: 0.09109919 },
        { languageCode: "it", confidence: 0.044518284 }
    ],
    executionTimeMS: 1775
};

// Llamada a la función mostrarInformacion con el objeto simulado


mostrarInformacion(jsonDt);
