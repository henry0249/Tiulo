$(function() {

	//'use strict';

	(function() {
		var $image = $('.img-container > img'); //图片容器
		var options = {
			// strict: false,//裁剪框是否可移动到图片外面
			// responsive: false,
			// checkImageOrigin: false

			 modal: false,//有灰色背景
			 guides: false,//裁剪框有引导线
			// highlight: false,
			// background: false,//图片以外的背景透明

			// autoCrop: false,//开始无裁剪框
			// autoCropArea: 0.5,
			 dragCrop: false,//图片可拖动
			 movable: false,//在裁剪框内图片可拖动
			 resizable: false,//裁剪框可变大变小
			// rotatable: false,
			// zoomable: false,
			// touchDragZoom: false,
			// mouseWheelZoom: false,

			// minCanvasWidth: 320,
			// minCanvasHeight: 180,
			// minCropBoxWidth: 160,
			// minCropBoxHeight: 90,
			// minContainerWidth: 320,
			// minContainerHeight: 180,

			// build: null,
			// built: null,
			// dragstart: null,
			// dragmove: null,
			// dragend: null,
			// zoomin: null,
			// zoomout: null,

			//设置裁剪框比例, (1/1)(16/9)(4/3)裁剪框的比例, (NaN为长宽可自由变)
			aspectRatio: 1 / 1,
			//裁剪预览容器
			preview: '.img-preview',
		};

		$image.on({
			'build.cropper': function(e) {
				console.log(e.type);
			},
			'built.cropper': function(e) {
				console.log(e.type);
			},
			'dragstart.cropper': function(e) {
				console.log(e.type, e.dragType);
			},
			'dragmove.cropper': function(e) {
				console.log(e.type, e.dragType);
			},
			'dragend.cropper': function(e) {
				console.log(e.type, e.dragType);
			},
			'zoomin.cropper': function(e) {
				console.log(e.type);
			},
			'zoomout.cropper': function(e) {
				console.log(e.type);
			}
		}).cropper(options);

		// Methods: 方法
		$(document.body).on('click', '[data-method]', function() {
			var data = $(this).data(), $target, result;

			if(data.method) {
				data = $.extend({}, data); // Clone a new one

				if(typeof data.target !== 'undefined') {
					$target = $(data.target);

					if(typeof data.option === 'undefined') {
						try {
							data.option = JSON.parse($target.val());
						} catch(e) {
							console.log(e.message);
						}
					}
				}

				result = $image.cropper(data.method, data.option);//裁剪后的图片
				//alert("result:"+result)
				if(data.method === 'getCroppedCanvas') {
					$('#getCroppedCanvasModal').find('.modal-body').html(result);
				}
				console.log(result)
				if($.isPlainObject(result) && $target) {
					try {
						$target.val(JSON.stringify(result));
					} catch(e) {
						console.log(e.message);
					}
				}

			}
		}).on('keydown', function (e) {
      switch (e.which) {
        case 37:
          e.preventDefault();
          $image.cropper('move', -1, 0);
          break;

        case 38:
          e.preventDefault();
          $image.cropper('move', 0, -1);
          break;

        case 39:
          e.preventDefault();
          $image.cropper('move', 1, 0);
          break;

        case 40:
          e.preventDefault();
          $image.cropper('move', 0, 1);
          break;
      }

    });

		//导入图片
		var $inputImage = $('#inputImage'),
			URL = window.URL || window.webkitURL, blobURL;

			if(URL) {
				$inputImage.change(function() {
					var files = this.files, file;
	
					if(files && files.length) {
						file = files[0];
	
						if(/^image\/\w+$/.test(file.type)) {
							blobURL = URL.createObjectURL(file);
							//alert("blobURL:"+blobURL)
							$image.one('built.cropper', function() {
								URL.revokeObjectURL(blobURL); // Revoke when load complete
							}).cropper('reset', true).cropper('replace', blobURL);
							$inputImage.val('');
						} else {
							showMessage('Please choose an image file.');
						}
					}
				});
			} else {
				$inputImage.parent().remove();
			}

	}());

});