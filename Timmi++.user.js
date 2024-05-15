// ==UserScript==
// @name         Timmi++
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Multi-selection pour le TT is back
// @author       AlexTNL
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @match        https://*.ilucca.net/Figgo/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ilucca.net
// @updateURL    https://srp-alexistnl.github.io/TimmiPlus/Timmi++.user.js
// @downloadURL  https://srp-alexistnl.github.io/TimmiPlus/Timmi++.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(() => {
        addMultiSelection();
    }, 2000);

    var jQuery_3 = $.noConflict(true);

    addMultiSelection();
    var multiSelectionActivate = false

    function addMultiSelection(){
        console.log("Activate addMultiSelection")
        var selectedClass = "selected"

        var keyPress = ""
        document.addEventListener('keydown', function(event) {
            console.log(event.key)
            if (event.key != "Meta") {
                keyPress = event.key; // "a", "1", "Shift", etc.
            }
        });

        document.addEventListener('keyup', function(event) {
            if (event.key == keyPress) {
                console.log(event.key)
                keyPress = ""  // "a", "1", "Shift", etc.
            }
        });
        //Add button for activate feature
        jQuery_3('.advancedOptions-container')[0].insertAdjacentHTML('afterbegin', `<button id="btn_multiselection" class="mod-notUnderlined u-marginRightSmall link">Activer la multi-selection</button>`);

        const styles = `

        @keyframes blink {
  0% { background-color: #7547D1; }
  50% { background-color: transparent; }
  100% { background-color: #7547D1; }
}

.selectedAM > .AM {
  animation: blink 1s infinite;
}

.selectedPM > .PM {
  animation: blink 1s infinite;
}

.selected > .AM {
  animation: blink 1s infinite;
}

.selected > .PM {
  animation: blink 1s infinite;
}

        `

        var styleSheet = document.createElement("style")
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        jQuery_3('#btn_multiselection').click(function(){

            var btn = jQuery_3("#btn_multiselection")[0]
            if (!jQuery(btn).hasClass("alreadyClicked")) {
                jQuery.each(jQuery_3('.na, .fl-day'), function(index, el){el.onclick = undefined}) //Delete timmi default click event
                jQuery.each(jQuery_3('.na'), function(index, el){el.onclick = function (e) {
                    e.preventDefault();

                    var jQuerythis = jQuery(this);
                    console.log(e.key)
                    // Detecting ctrl (windows) / meta (mac) key.
                    if (e.ctrlKey || e.metaKey) {
                        if (jQuerythis.hasClass(selectedClass)) {
                            jQuerythis.removeClass(selectedClass);
                        } else {
                            jQuerythis.addClass(selectedClass)
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
                        jQuery_3('.na').removeClass(selectedClass);
                        jQuerythis.addClass(selectedClass);
                    }
                }});
                btn.innerHTML = "Mode: \nToute la journée"
                jQuery(btn).addClass("alreadyClicked")
                jQuery_3('.advancedOptions-container')[0].innerHTML = `<button id="btn_validate_selection" class="button palette-secondary btn_continuer">Valider le télétravail 🏠</button>`+jQuery_3('.advancedOptions-container')[0].innerHTML
                jQuery_3('#btn_validate_selection').click(function(){validateSelection()})

                jQuery_3('#btn_multiselection').click(function(){
                    if (selectedClass == "selected") {// Go to AM
                        selectedClass = "selectedAM"
                        jQuery_3('#btn_multiselection')[0].innerHTML = "Mode: \nMatin"
                    } else if (selectedClass == "selectedAM") {// Go to AM
                        selectedClass = "selectedPM"
                        jQuery_3('#btn_multiselection')[0].innerHTML = "Mode: \nAprès-Midi"
                    } else if (selectedClass == "selectedPM") {// Go to AM
                        selectedClass = "selected"
                        jQuery_3('#btn_multiselection')[0].innerHTML = "Mode: \nToute la journée"
                    }
                })

            }
        })
    }

    function validateSelection(){

        jQuery_3("#btn_validate_selection").prop('disabled', true);
        document.body.style.cursor='wait'
        const selectedDays = jQuery.map(jQuery_3(".selected"), function(el){
            var jQuerythis = jQuery(el);
            const day = ("0" + jQuerythis.parent().index()).slice(-2);
            const month = ("0" + jQuerythis.closest('tr').attr("mois")).slice(-2);
            const year = jQuerythis.closest('tr').attr("annee");
            return `${year}-${month}-${day}T00:00:00`
        })
        console.log(selectedDays)
        selectedDays.forEach(function(selectedDay){
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

        const selectedDaysAM = jQuery.map(jQuery_3(".selectedAM"), function(el){
            var jQuerythis = jQuery(el);
            const day = ("0" + jQuerythis.parent().index()).slice(-2);
            const month = ("0" + jQuerythis.closest('tr').attr("mois")).slice(-2);
            const year = jQuerythis.closest('tr').attr("annee");
            return `${year}-${month}-${day}T00:00:00`
        })
        console.log(selectedDaysAM)
        selectedDaysAM.forEach(function(selectedDay){
            jQuery.ajax({
                url : "https://showroomprive.ilucca.net/api/v3/leaveRequestFactory?isCreation=true",
                type : "POST",
                data : JSON.stringify(getLeaveRequestPayloadForAM(selectedDay)),
                contentType: "application/json; charset=utf-8",
                async : false,
                success : function(){
                    console.log("Ok pour : " + selectedDay)
                }
            })
        })

        const selectedDaysPM = jQuery.map(jQuery_3(".selectedPM"), function(el){
            var jQuerythis = jQuery(el);
            const day = ("0" + jQuerythis.parent().index()).slice(-2);
            const month = ("0" + jQuerythis.closest('tr').attr("mois")).slice(-2);
            const year = jQuerythis.closest('tr').attr("annee");
            return `${year}-${month}-${day}T00:00:00`
        })
        selectedDaysPM.forEach(function(selectedDay){
            jQuery.ajax({
                url : "https://showroomprive.ilucca.net/api/v3/leaveRequestFactory?isCreation=true",
                type : "POST",
                data : JSON.stringify(getLeaveRequestPayloadForPM(selectedDay)),
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

    function getLeaveRequestPayloadForAM(selectedDay) {
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
            "endsAM": true,
            "isHalfDay": true,
            "unit": 0,
            "autoCreate": true,
            "ownerId": window.homeParams.idUser, //Debut Variables utile
            "endsOn": selectedDay,
            "startsOn": selectedDay,
            "balanceEstimateEndsOn": "2024-04-30T00:00:00", // A modifier ???
        }
    }

    function getLeaveRequestPayloadForPM(selectedDay) {
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
            "startsAM": false, // Pour utiliser un boolean alors que y'a un magnifique datetime après
            "endsAM": false,
            "isHalfDay": true,
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
