
// ==UserScript==
// @name         Timmi++
// @namespace    http://tampermonkey.net/
// @version      0.0.1-alpha
// @description  Multi-selection pour le TT is back !
// @author       AlexTNL
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @match        https://showroomprive.ilucca.net/timmi-absences
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ilucca.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(() => {
      addMultiSelection();
  }, 5000);

    var multiSelectionActivate = false
    function addMultiSelection(){
        console.log("Activate addMultiSelection")
        //Add button for activate feature
        var iframe = jQuery("#main-iframe").contents()

        iframe.find('.advancedOptions-container')[0].innerHTML = `<button id="btn_multiselection" class="mod-notUnderlined u-marginRightSmall link">Activer la multi-selection</button>`+iframe.find('.advancedOptions-container')[0].innerHTML
        /*if(jQuery("input#application")[0].value == '6' && jQuery("table.calendar").length >= 1){
            jQuery(".advancedOptions-container")[0].innerHTML += `<button id="btn_multiselection">Activer la multi-selection</button>`
        }*/

        const styles = `.selected {
            border-color: #ff0000 !important;
            border-style: solid;
            border-width: 5px;
        }`

        var styleSheet = document.createElement("style")
        styleSheet.innerText = styles;
        document.querySelector('#main-iframe').contentDocument.head.appendChild(styleSheet);


        jQuery("#main-iframe").contents().find('#btn_multiselection').click(function(){

            var btn = iframe.find("#btn_multiselection")[0]
            if (!jQuery(btn).hasClass("alreadyClicked")) {
                jQuery.each(iframe.find('.na, .fl-day'), function(index, el){el.onclick = undefined}) //Delete timmi default click event
                jQuery.each(iframe.find('.na'), function(index, el){el.onclick = function (e) {
                    e.preventDefault();

                    var jQuerythis = jQuery(this);
                    console.log(jQuerythis.parent().index())

                    // Detecting ctrl (windows) / meta (mac) key.
                    if (e.ctrlKey || e.metaKey) {
                        if (jQuerythis.hasClass('selected')) {
                            jQuerythis.removeClass('selected');
                        } else {
                            jQuerythis.addClass('selected')
                        }
                    }
                    // Detecting shift key
                    else if (e.shiftKey) {
                        function toDate(dateStr) {
                            let parts = dateStr.split("/")
                            return new Date(parts[2], parts[1] - 1, parts[0])
                        }

                        var currentSelectedId = jQuery('.selected').eq(0).attr("id");

                        // Get the shift+click element
                        var selectedElementId=jQuerythis[0].id


                        var dates = getDaysArray(toDate(currentSelectedId), toDate(selectedElementId))

                        dates.append(toDate(selectedElementId))

                        dates.forEach(date => {
                            const format_date = format(date)
                            console.log(format_date)
                        })

                    } else {
                        jQuery('.calendar tr td.clickable').removeClass('selected');
                        jQuerythis.addClass('selected');
                    }
                }});
                btn.innerHTML = "Multi-Selection Activée ! (CTRL + Click)"
                jQuery(btn).addClass("alreadyClicked")
                iframe.find('.advancedOptions-container')[0].innerHTML = `<button id="btn_validate_selection" class="button palette-secondary btn_continuer">Valider le télétravail 🏠</button>`+iframe.find('.advancedOptions-container')[0].innerHTML
                jQuery("#main-iframe").contents().find('#btn_validate_selection').click(function(){validateSelection()})

            } else {
                location.reload();
            }

        })
    }

    function validateSelection(){

        var iframe = jQuery("#main-iframe").contents()
        $("#btn_validate_selection").prop('disabled', true);
        document.body.style.cursor='wait'
        const selectedDays = jQuery.map(iframe.find(".selected"), function(el){
            var jQuerythis = jQuery(el);
            const day = ("0" + jQuerythis.parent().index()).slice(-2);
            const month = ("0" + jQuerythis.closest('tr').attr("mois")).slice(-2);
            const year = jQuerythis.closest('tr').attr("annee");
            return `${year}-${month}-${day}T00:00:00`
        })
        console.log(selectedDays)
        selectedDays.forEach(function(selectedDay){
                //const targetUrl = location.href.split("open")[0] + "open/da" //Bof
            console.log(getLeaveRequestPayload(selectedDay))
            jQuery.ajax({
                url : "https://showroomprive.ilucca.net/api/v3/leaveRequestFactory?isCreation=true",
                type : "POST",
                data : JSON.stringify(getLeaveRequestPayload(selectedDay)),
                contentType: "application/json; charset=utf-8",
                async : false,
                success : function(){
                    console.log("Ok pour : " + selectedDay)
                }
            })
        })
        console.log("fini")
        location.reload();
    }

    function getLeaveRequestPayload(selectedDay) {
        return { // Debut de variables qui ne servent à rien mais qui sont quand même là
            "daysUnit": true,
            "displayAllUnits": false,
            "allUnitAccounts":
            [
            {
                "unit": 0,
                "leaveAccounts":
                [
                {
                    "id": 1123,
                    "name": "Congés payés 2023",
                    "isRecurring": true
                },
                {
                    "id": 1124,
                    "name": "Congés payés 2024",
                    "isRecurring": true
                },
                {
                    "id": 1224,
                    "name": "RTT (Forfait jours) 2024",
                    "isRecurring": true
                }
                ]
            },
            {
                "unit": 3,
                "leaveAccounts":
                [
                {
                    "id": 8,
                    "name": "Annonce d’un handicap chez un enfant",
                    "isRecurring": false
                }
                ]
            },
            {
                "unit": 1,
                "leaveAccounts":
                [
                {
                    "id": 29,
                    "name": "Mi temps thérapeutique (Maladie)",
                    "isRecurring": false
                },
                {
                    "id": 59,
                    "name": "Mi temps thérapeutique (AT)",
                    "isRecurring": false
                },
                {
                    "id": 60,
                    "name": "Mi temps thérapeutique (AT Trajet)",
                    "isRecurring": false
                }
                ]
            }
            ],
            "warnings":
            [],
            "agreementWarnings":
            [],
            "availableAccounts":
            [],
            "otherAvailableAccounts":
            [
            {
                "leaveAccountId": 34,
                "leaveAccountName": "Télétravail",
                "leaveAccountColor": "#7547D1",
                "autoCredit": true,
                "categoryType": "PUN",
                "unit": 0,
                "duration": 1,
                "isRemoteWork": false,
                "i18nLabels":
                [],
                "constraint":
                {
                    "allowOuterConsumption": 0,
                    "allowHalfDay": true,
                    "durationHour": 1,
                    "stepHour": 0.5,
                    "entitlementEndDateBalance": null,
                    "warnings":
                    [
                    {
                        "ruleId": 49,
                        "description": "Le plafond est de 2 jours par semaine.",
                        "error": false,
                        "info": true,
                        "concernedUsers":
                        [],
                        "accountId": 34
                    }
                    ]
                }
            }
            ],
            "daysOff":
            {},
            "unlimitedDaysOffCalculation": true,
            "duration": 1,
            "isValid": true,
            "areSupportingDocumentsManaged": true,
            "withCandidate": false,
            "startsAM": true, // Pour utiliser un boolean alors que y'a un magnifique datetime après
            "endsAM": false,
            "isHalfDay": false,
            "unit": 0,
            "autoCreate": true,
            "ownerId": window.homeParams.idUser, //Debut Variables utile
            "endsOn": selectedDay,
            "startsOn": selectedDay,
            "balanceEstimateEndsOn": "2024-04-30T00:00:00", // A modifier ???
        }
    }


    // Your code here...
})();