(function(){var e={qiniuRegion:"",qiniuImageURLPrefix:"",qiniuUploadToken:"",qiniuUploadTokenURL:"",qiniuUploadTokenFunction:null,qiniuShouldUseQiniuFileName:false};module.exports={init:g,upload:d,};function g(h){e={qiniuRegion:"",qiniuImageURLPrefix:"",qiniuUploadToken:"",qiniuUploadTokenURL:"",qiniuUploadTokenFunction:null,qiniuShouldUseQiniuFileName:false};f(h)}function f(h){if(h.region){e.qiniuRegion=h.region}else{console.error("qiniu uploader need your bucket region")}if(h.uptoken){e.qiniuUploadToken=h.uptoken}else{if(h.uptokenURL){e.qiniuUploadTokenURL=h.uptokenURL}else{if(h.uptokenFunc){e.qiniuUploadTokenFunction=h.uptokenFunc}}}if(h.domain){e.qiniuImageURLPrefix=h.domain}e.qiniuShouldUseQiniuFileName=h.shouldUseQiniuFileName}function d(j,k,h,i){if(null==j){console.error("qiniu uploader need filePath to upload");return}if(i){f(i)}if(e.qiniuUploadToken){c(j,k,h,i)}else{if(e.qiniuUploadTokenURL){b(function(){c(j,k,h,i)})}else{if(e.qiniuUploadTokenFunction){e.qiniuUploadToken=e.qiniuUploadTokenFunction();if(null==e.qiniuUploadToken&&e.qiniuUploadToken.length>0){console.error("qiniu UploadTokenFunction result is null, please check the return value");return}}else{console.error("qiniu uploader need one of [uptoken, uptokenURL, uptokenFunc]");return}}}}function c(k,m,h,j){if(null==e.qiniuUploadToken&&e.qiniuUploadToken.length>0){console.error("qiniu UploadToken is null, please check the init config or networking");return}var i=a(e.qiniuRegion);var n=k.split("//")[1];if(j&&j.key){n=j.key}var l={"token":e.qiniuUploadToken};if(!e.qiniuShouldUseQiniuFileName){l["key"]=n}wx.uploadFile({url:i,filePath:k,name:"file",formData:l,success:function(p){var r=p.data;try{var q=JSON.parse(r);var o=e.qiniuImageURLPrefix+"/"+q.key;q.imageURL=o;console.log(q);if(m){m(q)}}catch(s){console.log("parse JSON failed, origin String is: "+r);if(h){h(s)}}},fail:function(o){console.error(o);if(h){h(o)}}})}function b(h){wx.request({url:e.qiniuUploadTokenURL,success:function(j){var i=j.data.uptoken;if(i&&i.length>0){e.qiniuUploadToken=i;if(h){h()}}else{console.error("qiniuUploader cannot get your token, please check the uptokenURL or server")}},fail:function(i){console.error("qiniu UploadToken is null, please check the init config or networking: "+i)}})}function a(i){var h=null;switch(i){case"ECN":h="https://up.qbox.me";break;case"NCN":h="https://up-z1.qbox.me";break;case"SCN":h="https://up-z2.qbox.me";break;case"NA":h="https://up-na0.qbox.me";break;default:console.error("please make the region is with one of [ECN, SCN, NCN, NA]")}return h}})();