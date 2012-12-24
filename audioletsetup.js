  var VERTEXDRAW = (function() {
  
    function Synth(audiolet, frequency) {
      this.audiolet = audiolet;
      this.frequency = frequency;
      this.gain = null;
      this.envelope = null;
      this.sine = null;
      if (Synth.prototype.synthSetup == undefined) {
        Synth.prototype.synthSetup = function() {
          this.sine = new Sine(this.audiolet, this.frequency);
          this.gain = new Gain(this.audiolet);
          this.envelope = new PercussiveEnvelope(this.audiolet, 1, 0.2, 0.5, function() { this.audiolet.scheduler.addRelative(0, this.remove.bind(this));}.bind(this));
          //extend(Synth, AudioletGroup);
          extend(this, AudioletGroup);
          this.envelope.connect(this.gain,0,1);
          this.sine.connect(this.gain);
          this.gain.connect(this.outputs[0]);

          return this.sine;
        };
      };
      // AudioletGroup ctor params: audiolet, #inputs, #outputs
      AudioletGroup.apply(this, [this.audiolet, 0, 1]);
    }

    function AudioletApp() {
      this.outX = null;
      this.outY = null;
      this.audiolet = null;
    }
    
    var audioletRunner = function(outX, outY) {
      //trying to stick this in a conditional
      if (this.audiolet == undefined) {
        this.audiolet = new Audiolet();
      }
      var frequencyPattern = new PSequence([outX], outY, outY);
      this.audiolet.scheduler.play([frequencyPattern], 1, 
        function(frequency) {
          var synth = new Synth(this.audiolet, frequency);
          synth.synthSetup();
          //console.log(synth);
          
          synth.connect(this.audiolet.output);
          //console.log(synth);
        }.bind(this)
      );
    };
    
    function audioFactory() {
      AudioletApp.prototype.audioletRun = audioletRunner;
      extend(Synth, AudioletGroup);
      return new AudioletApp;
    }

    return audioFactory();
  })();

