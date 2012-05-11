/*
	*  Project    : JavaScript Memory Game
	*  Description: JavaScript Memory Game jQuery plugin
	*  Repository : https://github.com/ludder/jquery-memory-game 
	*  Author     : Tom Greuter - www.tomgreuter.nl
	*  License    : MIT
	*  jQueryBP   : https://github.com/zenorocha/jquery-boilerplate
	*  TODO: disable fast clicking opening more than 2 cards
	*  TODO: handle square images from flickr
 */

;(function ( $, window, undefined ) {

		var memoryGame = 'memoryGame',
				document   = window.document,
				openCards  = [],
				nrAttempts = 0,
				defaults   = {
					selector : {
						card             : '.card',
						empty            : '.empty',
						notification_area: '#notification',
						notification_text: '#notification p span',
						selected         : '.selected'
					},
					classname : {
						empty   : 'empty',
						height  : 'height',
						width   : 'width',
						selected: 'selected'
					},
					timeout_showcard    : 800,
					timeout_notification: 2000
				};

		function MemoryGame( element, options ) {
			this.element = element;

			this.options = $.extend( {}, defaults, options) ;

			this._defaults = defaults;
			this._name     = memoryGame;
			this._version  = '0.1';

			this.init();
		}

		MemoryGame.prototype.init = function () {
			this.randomizeCards();
			this.setListenerOnCards();
			this.centerImages();
		};

		MemoryGame.prototype.setListenerOnCards = function () {
			var self = this;
			$(this.options.selector.card, this.element).on('click', function(){
				self.handleCardClick( $(this) );
			});
		};

		MemoryGame.prototype.handleCardClick = function ( $card ) {
			if (this.isCardOpen( $card )) { return; }
			if (this.isCardEmpty( $card )) { return; }
			this.selectCard( $card );
			this.checkForPair();
			this.handleNastyBrowserBugs();
		};

		MemoryGame.prototype.reloadPage = function () {
			document.location = document.location;
		};

		MemoryGame.prototype.randomizeCards = function () {
			var arr = [],
					randomNr;
			$cards = $(this.options.selector.card, this.element);
			while ($cards.length>0) {
				randomNr = this.getRandomNumber($cards.length);
				arr.push( $cards[randomNr] );
				$cards.splice(randomNr, 1);
			}
			$(this.element).empty().append(arr);
		};

		MemoryGame.prototype.getRandomNumber = function ( range ) {
			return Math.floor(Math.random()*(range));
		};

		MemoryGame.prototype.handleNastyBrowserBugs = function () {
			window.getSelection().removeAllRanges(); // prevent selection in FF, see: http://www.w3lessons.com/2011/09/disable-enable-deselect-text-selection.html
		};

		MemoryGame.prototype.updateCounter = function () {
			nrAttempts ++;
		};

		MemoryGame.prototype.checkForPair = function () {
			if (openCards.length > 1) {
				this.updateCounter();
				if (this.isPair()) {
					this.closePair();
				} else {
					this.resetCards();
				}
			}
		};

		MemoryGame.prototype.endGame = function () {
			// Show fancy notication and reload page
			if ($(this.options.selector.card, this.element).length === $(this.options.selector.empty).length) {
				$(this.options.selector.notification_text).text(nrAttempts);
				$(this.options.selector.notification_area)
					.show()
					.animate(
						{ width:0, height:0, left:"50%", top:"50%", fontSize:0 },
						this.options.timeout_notification,
						this.reloadPage
					);
			}
		};

		MemoryGame.prototype.selectCard = function ( $card ) {
			$card.addClass(this.options.classname.selected);
			openCards.push($card);
		};

		MemoryGame.prototype.closePair = function () {
			var self = this;
			setTimeout( function() {
				while (openCards.length>0) {
					openCards.shift().removeClass(self.options.classname.selected).addClass(self.options.classname.empty);
				}
				self.endGame();
			}, self.options.timeout_showcard/2);
		};

		MemoryGame.prototype.isCardOpen = function ( $card ) {
			return this.cardHasClassname($card, this.options.classname.selected);
		};

		MemoryGame.prototype.isCardEmpty = function ( $card ) {
			return this.cardHasClassname($card, this.options.classname.empty);
		};

		MemoryGame.prototype.cardHasClassname = function ( $card, classname ) {
			if ($card.hasClass(classname)) {
				return true;
			}
			return false;
		};

		MemoryGame.prototype.isPair = function () {
			if (openCards.length === 2) {
				if (openCards[0].html() === openCards[1].html()) {
					return true;
				}
			}
			return false;
		};

		MemoryGame.prototype.resetCards = function () {
			var self = this;
			setTimeout( function() {
				$(self.options.selector.card).removeClass(self.options.classname.selected);
				openCards = [];
			}, self.options.timeout_showcard);
		};

		MemoryGame.prototype.centerImages = function () {
			var $img;
			var self = this;
			$(this.options.selector.card + ' img', this.element).on('load', function() {
				$img = $(this);
				if ($img.height() < $img.width()) {
					$img.addClass(self.options.classname.width);
				} else {
					$img.addClass(self.options.classname.height);
				}
			});
		};

		$.fn[memoryGame] = function ( options, callback ) {
				return this.each(function () {
						if (!$.data(this, 'plugin_' + memoryGame)) {
								$.data(this, 'plugin_' + memoryGame, new MemoryGame( this, options ));
						}
						if (typeof callback == 'function') {
							callback.call(this); // brings the scope to the callback
						}
				});
		};

}(jQuery, window));