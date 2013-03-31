/**
 * base javascript application
 *
 * @package    public_js
 * @copyright  Copyright (c) Tobias Zeising (http://www.aditu.de)
 * @license    GPLv3 (http://www.gnu.org/licenses/gpl-3.0.html)
 */
var selfoss = {

    /**
     * current filter settings
     * @var mixed
     */
    filter: {
        offset: 0,
        itemsPerPage: 0,
        search: '',
        type: 'newest',
        tag: '',
        source: '',
        ajax: true
    },

    
    /**
     * initialize application
     */
    init: function() {
        jQuery(document).ready(function() {
            // reduced init on login
            if($('#login').length>0) {
                $('#username').focus();
                return;
            }
        
            // set items per page
            selfoss.filter.itemsPerPage = $('.entry').length;
            
            // initialize type by homepage config param
            selfoss.filter.type = $('#nav-filter li.active').attr('id').replace('nav-filter-', '');
            
            // init events
            selfoss.events.init();
            
            // init shortcut handler
            selfoss.shortcuts.init();
        });
    },
    
    
    /**
     * returns an array of id value pairs of all form elements in given element
     *
     * @return void
     * @param element containing the form elements
     */
    getValues: function(element) {
        var values = {};
        
        $(element).find(':input').each(function (i, el) {
            // get only input elements with id
            if($.trim($(el).attr('id')).length!=0) {
                values[$(el).attr('id')] = $(el).val();
                if($(el).attr('type')=='checkbox')
                    values[$(el).attr('id')] = $(el).attr('checked') ? 1 : 0;
            }
        });
        
        return values;
    },
    
    
    /**
     * insert error messages in form
     *
     * @return void
     * @param form target where input fields in
     * @param errors an array with all error messages
     */
    showErrors: function(form, errors) {
        $(form).find('span.error').remove();
        $.each(errors, function(key, val) {
            form.find('#'+key).addClass('error').parent('li').append('<span class="error">'+val+'</span>');
        });
    },
    
    
    /**
     * indicates whether a mobile device is host
     *
     * @return true if device resolution smaller equals 1024
     */
    isMobile: function() {
        // first check useragent
        if((/iPhone|iPod|iPad|Android|BlackBerry/).test(navigator.userAgent))
            return true;
        
        // otherwise check resolution
        return selfoss.isTablet() || selfoss.isSmartphone();
    },
    
    
    /**
     * indicates whether a tablet is the device or not
     *
     * @return true if device resolution smaller equals 1024
     */
    isTablet: function() {
        if($(window).width()<=1024)
            return true;
        return false;
    },

    
    /**
     * indicates whether a tablet is the device or not
     *
     * @return true if device resolution smaller equals 1024
     */
    isSmartphone: function() {
        if($(window).width()<=640)
            return true;
        return false;
    },
    
    
    /**
     * refresh current items.
     *
     * @return void
     */
    reloadList: function() {
        $('#content').addClass('loading').html("");
        
        $.ajax({
            url: $('base').attr('href'),
            type: 'GET',
            dataType: 'json',
            data: selfoss.filter,
            success: function(data) {
                $('.nav-filter-newest span').html(data.all);
                $('.nav-filter-unread span').html(data.unread);
                $('.nav-filter-starred span').html(data.starred);
                
                $('#content').html(data.entries);
                $(document).scrollTop(0);
                selfoss.events.entries();
                selfoss.events.search();
                location.hash = "";
                
                // make unread itemcount red
                if(data.unread>0)
                    $('.nav-filter-unread span').addClass('unread');
                
                // update tags
                selfoss.refreshTags(data.tags);
                
                // update sources
                selfoss.refreshSources(data.sources);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (textStatus == "parsererror") {
                    location.reload();
                    return;
                }
                alert('Load list error: ' + errorThrown);
            },
            complete: function(jqXHR, textStatus) {
                $('#content').removeClass('loading');
            }
        });
    },
    
    
    /**
     * refresh current tags.
     *
     * @return void
     */
    reloadTags: function() {
        $('#nav-tags').addClass('loading');
        $('#nav-tags li:not(:first)').remove();
        
        $.ajax({
            url: $('base').attr('href')+'tags',
            type: 'GET',
            success: function(data) {
                $('#nav-tags').append(data);
                selfoss.events.navigation();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert('Load tags error: '+errorThrown);
            },
            complete: function(jqXHR, textStatus) {
                $('#nav-tags').removeClass('loading');
            }
        });
    },
    
    
    /**
     * refresh taglist.
     *
     * @return void
     * @param tags the new taglist as html
     */
    refreshTags: function(tags) {
        var currentTag = $('#nav-tags li').index($('#nav-tags .active'));
        $('#nav-tags li:not(:first)').remove();
        $('#nav-tags').append(tags);
        if(currentTag>=0)
            $('#nav-tags li:eq('+currentTag+')').addClass('active');
        selfoss.events.navigation();
    },
    
    
    /**
     * refresh sources list.
     *
     * @return void
     * @param sources the new sourceslist as html
     */
    refreshSources: function(sources) {
        var currentSource = $('#nav-sources li').index($('#nav-sources .active'));
        $('#nav-sources li').remove();
        $('#nav-sources').append(sources);
        if(currentSource>=0)
            $('#nav-sources li:eq('+currentSource+')').addClass('active');
        selfoss.events.navigation();
    },
    
    
    /**
     * anonymize links
     *
     * @return void
     * @param parent element
     */
    anonymize: function(parent) {
        var anonymizer = $('#config').data('anonymizer');
        if(anonymizer.length>0) {
            parent.find('a').each(function(i,link) {
                link = $(link);
                if(typeof link.attr('href') != "undefined" && link.attr('href').indexOf(anonymizer)!=0) {
                    link.attr('href', anonymizer + link.attr('href'));
                }
            });
        }
    }
};

selfoss.init();