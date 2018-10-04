var nick = document.getElementById("user-nick");
var btnDownload = document.getElementById("btnDownload");
var contador = document.getElementById("contadorDownloads");

init();
habilitarDownload();

function init() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			contador.innerHTML = this.responseText;
		}
	};

	xhttp.open("GET", "getcountdownloads.php", true);
	xhttp.send();
}


function habilitarDownload() {
	if(nick.value < 1) {
		btnDownload.disabled = true;
	} else {
		btnDownload.disabled = false;
	}
}

function baixarImagem() {
	var img = new Image();
	img.src = "images/capa-steam-clean.png";
	img.setAttribute("crossOrigin", "Anonymous");
	var canvas = document.getElementById("canvasImg");
	var context = canvas.getContext("2d");
	canvas.width = 630;
	canvas.height = 630;
	img.onload = function () {
		context.drawImage(img, 0, 0, 630, 630);
		context.font = "70px csFont";
		context.fillStyle = "white";
		context.textAlign = "center";
		context.fillText(nick.value, canvas.width / 2, 450);


		// Download
       ReImg.fromCanvas(document.getElementById('canvasImg')).downloadPng("brazuka-capa.png");

       var xhttp = new XMLHttpRequest();
       xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            window.location.reload();
        }
    };
    xhttp.open("GET", "setcountdownloads.php", true);
    xhttp.send();
}
}

ReImg = {

    OutputProcessor: function(encodedData, svgElement) {

        var isPng = function() {
            return encodedData.indexOf('data:image/png') === 0;
        };

        var downloadImage = function(data, filename) {
            var a = document.createElement('a');
            a.href = data;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
        };

        return {
            toBase64: function() {
                return encodedData;
            },
            toImg: function() {
                var imgElement = document.createElement('img');
                imgElement.src = encodedData;
                return imgElement;
            },
            toCanvas: function(callback) {
                var canvas = document.createElement('canvas');
                var boundedRect = svgElement.getBoundingClientRect();
                canvas.width = boundedRect.width;
                canvas.height = boundedRect.height;
                var canvasCtx = canvas.getContext('2d');

                var img = this.toImg();
                img.onload = function() {
                    canvasCtx.drawImage(img, 0, 0);
                    callback(canvas);
                };
            },
            toPng: function() {
                if (isPng()) {
                    var img = document.createElement('img');
                    img.src = encodedData;
                    return img;
                }

                this.toCanvas(function(canvas) {
                    var img = document.createElement('img');
                    img.src = canvas.toDataURL();
                    return img;
                });
            },
            toJpeg: function(quality) { // quality should be between 0-1
                quality = quality || 1.0;
                (function(q) {
                    this.toCanvas(function(canvas) {
                        var img = document.createElement('img');
                        img.src = canvas.toDataURL('image/jpeg', q);
                        return img;
                    });
                })(quality);
            },
            downloadPng: function(filename) {
                filename = filename || 'image.png';
                if (isPng()) {
                    // it's a canvas already
                    downloadImage(encodedData, filename);
                    return;
                }

                // convert to canvas first
                this.toCanvas(function(canvas) {
                    downloadImage(canvas.toDataURL(), filename);
                });
            }
        };
    },

    fromSvg: function(svgElement) {
        var svgString = new XMLSerializer().serializeToString(svgElement);
        return new this.OutputProcessor('data:image/svg+xml;base64,' + window.btoa(svgString), svgElement);
    },

    fromCanvas: function(canvasElement) {
        var dataUrl = canvasElement.toDataURL();
        return new this.OutputProcessor(dataUrl);
    }

};