sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"

],
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("frontend.project2.controller.View1", {
            onInit: function () {
                this.isRecognizing = false;
                this.mediaRecorder = null;
                this.recordedChunks = [];

                const oModel = new JSONModel();
                const oData = {
                    modelData: []
                };
                const oView = this.getView();

                oModel.setData(oData);
                oView.setModel(oModel);
                this._initializeSpeechRecognition()

                var templeteObj = {
                    "line_no.": null,
                    "sampleNumber": null,
                    "job": null,
                    "cup": [
                        {
                            "od": [
                                {
                                    "size": null,
                                    "dor": null,
                                    "taper": null
                                }
                            ]
                        },
                        {
                            "track": [
                                {
                                    "size": null,
                                    "dor": null
                                }
                            ]
                        }
                    ],
                    "cone": [
                        {
                            "bore": [
                                {
                                    "size": null,
                                    "dor": null,
                                    "taper": null
                                }
                            ]
                        }
                    ],
                    "assembely": [
                        {
                            "hardness": [
                                {
                                    "cup": null,
                                    "cone": null
                                }
                            ],
                            "standout": null,
                            "totalwidth/badstand": null,
                            "freerunning": [{
                                "notight": null
                            }],
                            "visual": [{
                                "asperstandard": null
                            }],
                            "foodchecking": [{
                                "asperstandard": null
                            }]
                        }
                    ]

                }



                this._fetchData(templeteObj)
            },
            _initializeSpeechRecognition: function () {
                this.recognition = new window.webkitSpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.lang = "en-US";
                this.recognition.interimResults = false;

                this.recognition.onstart = () => {
                    this.isRecognizing = true;
                    console.log("Ready to receive a command.");
                };

                this.recognition.onspeechend = () => {
                    console.log("Speech recognition has stopped.");
                    this._stopAndRestartRecognition();
                };

                this.recognition.onend = () => {
                    this.isRecognizing = false;
                    console.log("Recognition ended.");
                };

                this.recognition.onerror = (event) => {
                    console.error(`Error occurred in recognition: ${event.error}`);
                    if (event.error === "no-speech" || event.error === "aborted") {
                        this._stopAndRestartRecognition();
                    }
                };

                this.recognition.onresult = (event) => {
                    const transcript = event.results[event.results.length - 1][0].transcript;
                    const confidence = event.results[event.results.length - 1][0].confidence;

                    console.log(`Recognized: ${transcript}`);
                    console.log(`Confidence: ${confidence}`);
                    this._handleInput(transcript);
                };

                this._startRecognition();
            },

            _startRecognition: function () {
                if (!this.isRecognizing) {
                    this.recognition.start();
                }
            },

            _stopAndRestartRecognition: function () {
                if (this.isRecognizing) {
                    this.recognition.stop();
                    this.isRecognizing = false;
                    console.log("Stopping recognition for restart...");
                    setTimeout(() => {
                        this._startRecognition();
                    }, 500);
                }
            },

            _handleInput: function (input) {
                const normalizedInput = input.toLowerCase().trim();

                switch (normalizedInput) {
                    case 'hey google':
                        console.log('media record start');
                        this._startRecording();
                        break;
                    case 'bye google':
                        console.log('media record stop');
                        this._stopRecording();
                        break;
                    default:
                        console.log(normalizedInput);
                        break;
                }
            },

            _startRecording: function () {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        this.mediaRecorder = new MediaRecorder(stream);
                        this.recordedChunks = [];

                        this.mediaRecorder.ondataavailable = (event) => {
                            if (event.data.size > 0) {
                                this.recordedChunks.push(event.data);
                            }
                        };

                        this.mediaRecorder.onstop = () => {
                            const blob = new Blob(this.recordedChunks, { type: 'audio/wav' });
                            this.recordedChunks = [];
                            const url = URL.createObjectURL(blob);
                            console.log('Recording stopped. Blob URL:', url);
                            // this._convertToBase64(blob);
                            var formData = new FormData();
                            formData.append("audioFile", blob, "audio.wav");
                            console.log(formData)
                            $.ajax({
                                url: 'https://speechToTextApp-brash-alligator-ih.cfapps.us10-001.hana.ondemand.com/getText',
                                type: 'POST',
                                data: formData,
                                processData: false,
                                contentType: false,
                                success: function(response) {
                                    console.log("Recognized text:", response.text);
                                },
                                error: function(xhr, status, error) {
                                    console.error("Error during recognition:", xhr.responseText);
                                }
                            });
                        };

                        this.mediaRecorder.start();
                        console.log('Recording started.');
                    })
                    .catch(error => {
                        console.error('Error accessing media devices.', error);
                    });
            },

            _stopRecording: function () {
                if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                    this.mediaRecorder.stop();
                    console.log('Stopping recording...');
                } else {
                    console.log('No active recording to stop.');
                }
            },

            _convertToBase64: function (blob) {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64encodedData = reader.result;
                    const base64Data = {
                        "mime": base64encodedData.split(',')[0],
                        "data": base64encodedData.split(',')[1]
                    };
                    console.log(base64Data);
                };
                reader.onerror = (error) => {
                    console.error('Error converting to base64:', error);
                };
            },
            _dataTemplate: function (templateObj, dataObj) {
                var modelData = this.getView().getModel().getData();

                dataObj['value'].forEach(element => {
                    let newTemplate = JSON.parse(JSON.stringify(templateObj));
                    if (element['sampleNumber']) {
                        newTemplate['sampleNumber'] = element['sampleNumber'];
                    }
                    if (element['header1'] && newTemplate[element['header1']]) {
                        let header1Path = newTemplate[element['header1']];
                        if (Array.isArray(header1Path)) {
                            header1Path.forEach(subObj => {
                                if (subObj[element['header2']]) {
                                    let subPath = subObj[element['header2']];
                                    if (Array.isArray(subPath)) {
                                        subPath.forEach(innerObj => {
                                            if (innerObj[element['header3']] !== undefined) {
                                                innerObj[element['header3']] = element['value'];
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }

                    if (modelData['modelData'].length === 0) {
                        modelData['modelData'].push(newTemplate);
                        console.log('modelData is empty.');
                    } else {
                        // console.log(newTemplate)
                        let exists = false;
                        modelData['modelData'].forEach(existingTemplate => {
                            if (existingTemplate['sampleNumber'] === newTemplate['sampleNumber']) {
                                exists = true;
                                // console.log(newTemplate, existingTemplate)
                                this._MergeTwoTemplates(existingTemplate, newTemplate)
                                console.log(existingTemplate)

                            }

                        });
                        if (!exists) {
                            modelData['modelData'].push(newTemplate);
                            console.log('No match found, added newTemplate.');
                        }
                    }



                });

                this.getView().byId("mPage1").getModel().refresh(true);
            },
            _fetchData: function (templateObj) {
                var that = this
                var url = this.getOwnerComponent().getModel().getServiceUrl() + 'ResearchData'
                $.ajax({
                    url: url,
                    method: "GET",
                    success: function (res) {

                        that._dataTemplate(templateObj, res)

                    },
                    error: function (Error) {
                        console.log(Error)
                    }
                })
            },
            _MergeTwoTemplates: function (existingTemplate, newTemplate) {

                function mergeTemplates(existingTemplate, newTemplate) {
                    for (let key in newTemplate) {
                        if (newTemplate.hasOwnProperty(key)) {
                            if (typeof newTemplate[key] === 'object' && !Array.isArray(newTemplate[key]) && newTemplate[key] !== null) {
                                if (!existingTemplate[key]) {
                                    existingTemplate[key] = {};
                                }
                                mergeTemplates(existingTemplate[key], newTemplate[key]);
                            } else if (Array.isArray(newTemplate[key])) {
                                newTemplate[key].forEach((newElem, index) => {
                                    if (typeof newElem === 'object') {
                                        if (!existingTemplate[key]) {
                                            existingTemplate[key] = [];
                                        }
                                        if (!existingTemplate[key][index]) {
                                            existingTemplate[key][index] = {};
                                        }
                                        mergeTemplates(existingTemplate[key][index], newElem);
                                    } else {
                                        if (newElem !== null) {
                                            existingTemplate[key][index] = newElem;
                                        }
                                    }
                                });
                            } else {
                                if (newTemplate[key] !== null && newTemplate[key] !== undefined) {
                                    existingTemplate[key] = newTemplate[key];
                                }
                            }
                        }
                    }
                }

                mergeTemplates(existingTemplate, newTemplate)
            }




        });
    });
