/**
 * Include your custom JavaScript here.
 *
 * We also offer some hooks so you can plug your own logic. For instance, if you want to be notified when the variant
 * changes on product page, you can attach a listener to the document:
 *
 * document.addEventListener('variant:changed', function(event) {
 *   var variant = event.detail.variant; // Gives you access to the whole variant details
 * });
 *
 * You can also add a listener whenever a product is added to the cart:
 *
 * document.addEventListener('product:added', function(event) {
 *   var variant = event.detail.variant; // Get the variant that was added
 *   var quantity = event.detail.quantity; // Get the quantity that was added
 * });
 *
 * If you are an app developer and requires the theme to re-render the mini-cart, you can trigger your own event. If
 * you are adding a product, you need to trigger the "product:added" event, and make sure that you pass the quantity
 * that was added so the theme can properly update the quantity:
 *
 * document.documentElement.dispatchEvent(new CustomEvent('product:added', {
 *   bubbles: true,
 *   detail: {
 *     quantity: 1
 *   }
 * }));
 *
 * If you just want to force refresh the mini-cart without adding a specific product, you can trigger the event
 * "cart:refresh" in a similar way (in that case, passing the quantity is not necessary):
 *
 * document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', {
 *   bubbles: true
 * }));
 */

let body = $("body");

body.bind("DOMNodeInserted", function() {
    const $this = $(this).find('.slick-initialized');
    $this.addClass('finally-loaded');
});

if (window.matchMedia("(max-width: 768px)").matches) {
  	window.onscroll = function() {
      var pageOffset = document.documentElement.scrollTop || document.body.scrollTop,
          btn = document.getElementById('scrollToTop');
      if (btn) btn.style.display = pageOffset > 1200 ? 'block' : 'none';
	}
}


$(".block-swatch__radio, .variant-swatch__radio").change(function () {
  setTimeout(function () { parcelamento(); }, 150);
});

function increaseValue() {
  var value = parseInt(document.getElementById('number').value, 10);
  value = isNaN(value) ? 0 : value;
  value++;
  document.getElementById('number').value = value;
}

function decreaseValue() {
  var value = parseInt(document.getElementById('number').value, 10);
  value = isNaN(value) ? 0 : value;
  value < 1 ? value = 1 : '';
  value--;
  document.getElementById('number').value = value;
}

$('.options:first-child').addClass('active')

$(".options").each(function(index) {
    $(this).on("click", function(){
      $('.options.active .selector-desconto').text($('.options.active .selector-desconto').attr('cup'))
      $('.options').removeClass('active')
      $(this).addClass('active')
      $('.options.active .selector-desconto').append(' APLICADO')
      $('.precode').remove()
      $('.price--compare').remove()
      $('.price-list').append('<p class="precode">' + $(this).find('.valortot span').text() + '</p>')
      $('.price').text($(this).find('.valortot b').text())

      $('.price .selector-desconto').remove()

      var cupom = $('.options.active .selector-desconto').text()

      if(cupom != '')
      $('.price').append('<p class="selector-desconto">' + cupom + '</p>')

      setTimeout(function(){ parcelamento2() }, 100);
    });
});

$(".options").each(function( index ) {
  var valor = parseFloat($(this).find('.valorunico b').text().replace('R$ ', '').trim())
  var menor = $('.options:first-child .valorunico b').text().replace('R$ ', '').replace(',', '.').trim()
  var result = ((valor - menor)*100 / valor) * (-1);
  var porcenta = 'CUPOM ' + result.toFixed(0).replace('.', ',') + '% OFF'
  $(this).find('.selector-desconto').attr('cup', porcenta )
  $(this).find('.selector-desconto').text(porcenta)
});

$(".product-form").each(function () {
    $(this).on('click', '.botaocmprar', function (event) {
      	var arraydeprodutos = [];
        event.stopImmediatePropagation();
        var idproduto = parseInt($('.options.active .iddavariante').attr('val'))
        var qtdproduto = parseInt($('.options.active .iddavariante').attr('qtd'))
        arraydeprodutos.push({
            id: idproduto,
            quantity: qtdproduto
        });
        console.log(arraydeprodutos)

        data = {
            items: arraydeprodutos
        }
        $.ajax({
            type: 'POST',
            url: '/cart/add',
            data: data,
            dataType: 'json',
            success: function (data) {
                setTimeout(function () {
            		//jQuery('.opencarrinho')[0].click();
            		window.location.href = '/cart'
                }, 500);
            }
        });
    });
})

function loadSlideAdvantages(quantity) {
    if(quantity > 0) {
        $(".advantages").slick({
            infinite: true,
            dots: false,
            arrows: false,
            slidesToShow: quantity,
            responsive: [
                {
                    breakpoint: 980,
                    settings: {
                        autoplay: true,
                        autoplaySpeed: 3000,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        infinite: true,
                        arrows: true,
                        prevArrow:
                            "<div\x20class=\x22slick-prev\x22><svg\x20width=\x22451.85px\x22\x20height=\x22451.85px\x22\x20enable-background=\x22new\x200\x200\x20451.847\x20451.847\x22\x20version=\x221.1\x22\x20viewBox=\x220\x200\x20451.847\x20451.847\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22m97.141\x20225.92c0-8.095\x203.091-16.192\x209.259-22.366l194.29-194.28c12.359-12.359\x2032.397-12.359\x2044.751\x200\x2012.354\x2012.354\x2012.354\x2032.388\x200\x2044.748l-171.92\x20171.9\x20171.9\x20171.91c12.354\x2012.354\x2012.354\x2032.391\x200\x2044.744-12.354\x2012.365-32.386\x2012.365-44.745\x200l-194.29-194.28c-6.167-6.177-9.252-14.274-9.252-22.372z\x22/></svg></div>",
                        nextArrow:
                            "<div\x20class=\x22slick-next\x22><svg\x20width=\x22451.85px\x22\x20height=\x22451.85px\x22\x20enable-background=\x22new\x200\x200\x20451.846\x20451.847\x22\x20version=\x221.1\x22\x20viewBox=\x220\x200\x20451.846\x20451.847\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22m345.44\x20248.29l-194.29\x20194.28c-12.359\x2012.365-32.397\x2012.365-44.75\x200-12.354-12.354-12.354-32.391\x200-44.744l171.91-171.91-171.91-171.9c-12.354-12.359-12.354-32.394\x200-44.748\x2012.354-12.359\x2032.391-12.359\x2044.75\x200l194.29\x20194.28c6.177\x206.18\x209.262\x2014.271\x209.262\x2022.366\x200\x208.099-3.091\x2016.196-9.267\x2022.373z\x22/></svg></div>",
                    }
                }
            ]
        });
    }
}

document.addEventListener('shopify:section:load', function (event) {
    loadSlideAdvantages($(event.target).find(".advantage").length);
});

loadSlideAdvantages(body.find(".advantage").length);
/* Animação pulsante — Botão WhatsApp */
@keyframes whatsapp-pulse {
  0%   
  /* Animação pulsante - Botão WhatsApp */
@keyframes whatsapp-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(37, 211, 102, 0);
    transform: scale(1.06);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
    transform: scale(1);
  }
}

#suporte-botao a,
.suporte-botao a,
a[href*="wa.me"],
a[href*="whatsapp"] {
  animation: whatsapp-pulse 2s ease-in-out infinite;
}
/* Animação pulsante - Botão de Suporte Flutuante */
@keyframes whatsapp-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
    transform: scale(1);
  }
  60% {
    box-shadow: 0 0 0 14px rgba(37, 211, 102, 0);
    transform: scale(1.07);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
    transform: scale(1);
  }
}

.suporte-botao {
  animation: whatsapp-pulse 2s ease-in-out infinite;
  border-radius: 50%;
}


