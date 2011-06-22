;(function() {

    var ui = {
          'buttons': {}
        , 'createLightbox': createLightbox
        , 'openLightbox': openLightbox
        , 'closeLightbox': closeLightbox
        , 'addButton': addButton
        , 'removeButton': removeButton
        , 'growl': growl
    };

    function createLightbox(uid, options) { 
        var clone, button, controller = {};
        options.title = (options.title || '');
        options.content = (options.content || '');
        options.buttons = (options.buttons || null);
        options.onpopup = (options.onpopup || function() {});

        // clone another lightbox, replace it's content, and add buttons
        GS.lightbox.open('locale');
        clone = $('#lightbox .locale').clone();
        GS.lightbox.close();

        $('#lightbox_header h3', clone).html(options.title);
        $('#lightbox_content .lightbox_content_block', clone).html(options.content);
        _.forEach(options.buttons, function(button, index) {
            addLightboxButton(clone, button);
        });

        // fill in and create the controller
        controller.name = 'GS.Controllers.Lightbox.' + uid + 'Controller';
        controller.proto = { 'onDocument': false };
        controller.init = function() {
            this.element.html(clone.html());
            options.onpopup.call(this);
        };

        GS.Controllers.BaseController.extend(controller.name, controller.proto, { 'init': controller.init });
        $('#lightbox').prepend('<div class="lbcontainer ' + uid + '"></div>');
    }

    function addLightboxButton(lightbox, button) {
        var buttonTag, containerTag, linkText;
        button.label = (button.label || '');
        button.uid = (button.uid || button.label.trim().toLowerCase().replace(" ", "_"));
        button.link = (button.link || false);
        button.pos = (button.pos === 'left' ? true : false);

        // TODO: should check if 'left/right' tag already exists?
        // TODO: accessing uid for event listeners?
        containerTag = $('<ul class="' + (button.pos ? 'left' : 'right') + '"><li class="last"></li></ul>');
        buttonTag = $('.close', lightbox).clone().removeClass('close').addClass(button.uid);
        $('span', buttonTag).html(button.label);
        
        if (button.link) {
            linkText = '<a href="' + button.link + '" target="blank" class="' + $(buttonTag).attr('class') + '">' + $(buttonTag).html() + '</a>';
            buttonTag = $(buttonTag).replaceWith(linkText); 
        }

        $('li', containerTag).append(buttonTag);
        $('#lightbox_footer .left', lightbox).before(containerTag);
    }


    function openLightbox(uid) {
        GS.lightbox.open(uid); 
    }

    function closeLightbox() {
        GS.lightbox.close(); 
    }


















    var PLAYER_DETAILS_DIV = '#playerDetails_queue';

    function addButton(id, options) {
        if (this.buttons[id] || id.substr(0, 1) != '#') {
            console.error('Button "' + id + '" already exists or is an invalid identifier');
            return;
        }

        var button, span;
        options.label = options.label || '';
        options.placement = (options.placement === 'prepend');
        options.onclick = (options.onclick || function() {});
        button = $('#queue_songs_button').clone().attr('id', id.slice(1)).click(options.onclick);
        span = $('span', button).removeAttr('id').removeAttr('data-translate-text').html(options.label);

        this.buttons[id] = { 'button': button, 'options': options };
        placeButton(id, options.placement);
    }

    function removeButton(id) { 
        if (this.buttons[id]) {
            $(id, PLAYER_DETAILS_DIV).remove();
            delete this.buttons[id];
        }
    }

    function placeButton(id, prepend) { 
        var button = ui.buttons[id].button;
        prepend ? $('.queueType', PLAYER_DETAILS_DIV).after(button)
                : $(PLAYER_DETAILS_DIV).append(button);
    }

    // $.subscribe('gs.player.queue.change', restoreButtons);
    function restoreButtons() {
        _.forEach(ui.buttons, function(button, key) { 
            if (!$(key, PLAYER_DETAILS_DIV).length) {
                placeButton(key, value.options.placement); 
            }
        });
    }    

    function growl(sender, message, delay) {
        delay || (delay = 2500);
        var container = growlContainer();
        var template = growlTemplate(sender, message);
        $(container).append(template);
        $(template).slideDown('fast').delay(delay).fadeOut('slow');
        setTimeout(function() { $(template).remove(); }, delay + 1000);
    }

    function growlTemplate(sender, message) {
        var style = 'display:none; background:rgba(0,0,0,0.7); z-index:1000; padding:10px; color:#ddd; -moz-border-radius:3px; -webkit-border-radius:3px; font-size:11px; margin-top:6px;';
        var template = $('<li style="' + style + '"><span class="sender">' + sender + '</span><span class="message">' + message + '</span></li>');
        $('.sender', template).css({ 'display': 'block', 'margin-bottom': '6px', 'color': '#fff' });  
        return $(template);
    }

    function growlContainer() {
        var container = $('#growl_container');
        if (container.length === 0) {
            container = $('<ul id="growl_container"></ul>');
            $(container).css({ 'position': 'absolute', 'width': '200px', 'bottom': 10, 'right': 10, 'z-index': '1000' });
            $('#page_wrapper').append(container);
        }
        return $(container);
    }

    window.ges || (window.ges = {});
    window.ges.ui = ui;

})();
