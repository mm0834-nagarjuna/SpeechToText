sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"

],
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("frontend.project1.controller.View1", {
            onInit: function () {
                this.isRecognizing = false;
                this.mediaRecorder = null;
                this.recordedChunks = [];

                const oModel = new JSONModel();
                const oData = {
                    modelData: [
                        {
                            "line_no.": 1,
                            "s.no.": 1,
                            "job": 1,
                            "cup": [
                                {
                                    "od": [
                                        {
                                            "size": 200,
                                            "dor": 200,
                                            "taper": 200
                                        }
                                    ]
                                },
                                {
                                    "track": [
                                        {
                                            "size": 40,
                                            "dor": 40
                                        }
                                    ]
                                }
                            ],
                            "cone": [
                                {
                                    "bore": [
                                        {
                                            "size": 20,
                                            "dor": 40,
                                            "taper": 30
                                        }
                                    ]
                                }
                            ],
                            "assembely": [
                                {
                                    "hardness": [
                                        {
                                            "cup": 30,
                                            "cone": 40
                                        }
                                    ],
                                    "standout": null,
                                    "totalwidth/badstand": null,
                                    "freerunning": [{
                                        "notight": 500
                                    }],
                                    "visual": [{
                                        "asperstandard": null
                                    }],
                                    "foodchecking": [{
                                        "asperstandard": 40
                                    }]
                                }
                            ]
                        },
                        {
                            "line_no.": 2,
                            "s.no.": 2,
                            "job": 1,
                            "cup": [
                                {
                                    "od": [
                                        {
                                            "size": 200,
                                            "dor": 200,
                                            "taper": 200
                                        }
                                    ]
                                },
                                {
                                    "track": [
                                        {
                                            "size": 40,
                                            "dor": 40
                                        }
                                    ]
                                }
                            ],
                            "cone": [
                                {
                                    "bore": [
                                        {
                                            "size": 20,
                                            "dor": 40,
                                            "taper": 30
                                        }
                                    ]
                                }
                            ],
                            "assembely": [
                                {
                                    "hardness": [
                                        {
                                            "cup": 30,
                                            "cone": 40
                                        }
                                    ],
                                    "standout": null,
                                    "totalwidth/badstand": null,
                                    "freerunning": [{
                                        "notight": 500
                                    }],
                                    "visual": [{
                                        "asperstandard": null
                                    }],
                                    "foodchecking": [{
                                        "asperstandard": 40
                                    }]
                                }
                            ]
                        }

                    ]
                };
                const oView = this.getView();

                oModel.setData(oData);
                oView.setModel(oModel);
                this._initializeSpeechRecognition()

                var templeteObj = {
                    "line_no.": null,
                    "s.no.": null,
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



                this._dataTemplate(templeteObj)
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
                            this._convertToBase64(blob);
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
            _dataTemplate: function (templateObj) {
                var dataObj = {
                    "header1": 'cup',
                    "header2": 'track',
                    "header3": 'size',
                    "value": 500,
                    "s.no.": 3
                };

                var modelData = this.getView().getModel().getData();
                console.log(modelData['modelData']);

                modelData['modelData'].forEach(element => {
                    for (let key in element) {
                        for (let subkey in dataObj) {
                            if (subkey === key && element[key] == dataObj[subkey]) {

                                if (element[dataObj['header1']] && Array.isArray(element[dataObj['header1']])) {
                                    element[dataObj['header1']].forEach(data => {
                                        if (data[dataObj['header2']] && Array.isArray(data[dataObj['header2']])) {
                                            data[dataObj['header2']].forEach(data2 => {
                                                if (data2.hasOwnProperty(dataObj['header3'])) {
                                                    data2[dataObj['header3']] = dataObj['value'];
                                                }
                                            });
                                        }
                                    });
                                }
                            } else {
                                if (dataObj.hasOwnProperty(key) && templateObj[key] == null) {
                                    templateObj[key] = dataObj[key];
                                }
                                if (templateObj[dataObj['header1']] && Array.isArray(templateObj[dataObj['header1']])) {
                                    templateObj[dataObj['header1']].forEach(data => {
                                        if (data[dataObj['header2']] && Array.isArray(data[dataObj['header2']])) {
                                            data[dataObj['header2']].forEach(data2 => {
                                                if (data2.hasOwnProperty(dataObj['header3'])) {
                                                    data2[dataObj['header3']] = dataObj['value'];
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    }
                });
                console.log(templateObj);
                modelData['modelData'].push(templateObj)
                this.getView().byId("mPage1").getModel().refresh(true);
                console.log(modelData['modelData'])
                this._saveData()
            },
            _saveData: function(){
                
            }


        });
    });
