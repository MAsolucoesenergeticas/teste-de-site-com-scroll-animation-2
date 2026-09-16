(function () {
  'use strict';

  var FRAME_COUNT = 144;
  var FRAME_PATH  = function (i) {
    return 'images/frame_' + String(i).padStart(3, '0') + '.jpg';
  };

  function iniciarScrub(section, canvas) {
    var ctx = canvas.getContext('2d');
    var images = [];
    var loadedCount = 0;
    var current = { frame: 1 };
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resizeCanvas() {
      canvas.width  = canvas.clientWidth  * dpr;
      canvas.height = canvas.clientHeight * dpr;
    }

    function drawFrame(index) {
      var img = images[index - 1];
      if (img && img.complete && img.naturalWidth) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // cover: preenche o canvas mantendo proporção da imagem
        var cw = canvas.width, ch = canvas.height;
        var iw = img.naturalWidth, ih = img.naturalHeight;
        var scale = Math.max(cw / iw, ch / ih);
        var sw = cw / scale, sh = ch / scale;
        var sx = (iw - sw) / 2, sy = (ih - sh) / 2;

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
      }
    }

    function preloadAll() {
      for (var i = 1; i <= FRAME_COUNT; i++) {
        var img = new Image();
        img.src = FRAME_PATH(i);
        img.onload = function () {
          loadedCount++;
          if (loadedCount === 1) drawFrame(current.frame); // primeira imagem já mostra algo
        };
        images.push(img);
      }
    }

    function atualizar() {
      var rect = section.getBoundingClientRect();
      var alturaTotal = section.offsetHeight - window.innerHeight;
      if (alturaTotal <= 0) return;

      var progresso = -rect.top / alturaTotal;
      progresso = Math.min(Math.max(progresso, 0), 1);

      var frameIndex = Math.min(
        FRAME_COUNT,
        Math.max(1, Math.round(progresso * (FRAME_COUNT - 1)) + 1)
      );

      if (frameIndex !== current.frame) {
        current.frame = frameIndex;
      }
      drawFrame(current.frame);
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () { atualizar(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', function () {
      resizeCanvas();
      drawFrame(current.frame);
    });
    window.addEventListener('orientationchange', function () {
      resizeCanvas();
      drawFrame(current.frame);
    });

    resizeCanvas();
    preloadAll();
    atualizar();
  }

  function init() {
    var mqReduce = window.matchMedia('(prefers-reduced-motion:reduce)');
    if (mqReduce.matches) return; // respeita acessibilidade

    var mqMobile = window.matchMedia('(max-width:720px)');
    if (mqMobile.matches) return; // mesmo fallback do CSS: cena estática no mobile

    var section = document.getElementById('cenaHero');
    var canvas  = document.getElementById('cenaCanvas');
    if (!section || !canvas) return;

    iniciarScrub(section, canvas);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
