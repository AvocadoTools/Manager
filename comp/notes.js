import AvocadoHBox from "../containers/hbox.js";
import AvocadoVBox from "../containers/vbox.js";

import AvocadoLabel from "../controls/label.js";
import AvocadoLink from "../controls/link.js";
import AvocadoTextarea from "../controls/textarea.js";

export default class AvocadoNotes extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
          position: relative;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        adc-hbox {
          gap: 16px;
        }

        adc-hbox:first-of-type {
          align-items: flex-end;
          margin: 0 0 2px 0;
        }

        adc-hbox:first-of-type adc-label {
          margin: 0 0 2px 0;
        }

        adc-hbox:last-of-type {
          height: 100%;
        }        

        adc-input,
        adc-textarea {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-label { 
          --label-font-size: 12px;
        }

        adc-link::part( button ) {
          font-size: 12px;
        }

        adc-textarea::part( error ) {
          display: none;
        }

        adc-vbox { 
          flex-basis: 0;
          flex-grow: 1;
        }

        div {
          background-color: #f4f4f4;
          color: #161616;
          display: none;
          flex-basis: 0;
          flex-grow: 1;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          overflow: scroll;
          text-rendering: optimizeLegibility;
        }

        #description {
          padding: 0 0 4px 0;
          --label-color: #6f6f6f;
        }

        #label {
          --label-color: #525252;
        }

        :host( [light] ) div {
          background-color: #ffffff;
        }

        :host( [markdown] ) div {
          display: block;
        }
        
        :host( [monospace] ) adc-textarea::part( input ) {
          font-family: 'IBM Plex Mono', monospace;
        }
      </style>
      <adc-hbox>
        <adc-vbox>
          <adc-label id="label">Notes</adc-label>        
          <adc-label id="description">Description</adc-label>                  
        </adc-vbox>
        <adc-link>Show preview</adc-link>
      </adc-hbox>
      <adc-hbox>
        <adc-textarea 
          placeholder="Notes">
        </adc-textarea>      
        <div></div>
      </adc-hbox>
    `;

    // Private
    this._data = null;
    this._touch = ( 'ontouchstart' in document.documentElement ) ? 'touchstart' : 'click';        

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$description = this.shadowRoot.querySelector( '#description' );    
    this.$label = this.shadowRoot.querySelector( '#label' );
    this.$link = this.shadowRoot.querySelector( 'adc-link' );
    this.$link.addEventListener( this._touch, () => this.doPreviewClick() );
    this.$markdown = this.shadowRoot.querySelector( 'div' );    
    this.$notes = this.shadowRoot.querySelector( 'adc-textarea' );
    this.$notes.addEventListener( 'input', () => this.doNotesChange() );
  }

  focus() {
    this.$notes.focus();
  }

  doNotesChange() {
    this.value = this.$notes.value;
  }

  doPreviewClick() {
    this.markdown = !this.markdown;
    this.focus();    
  }

   // When attributes change
  _render() {
    this.$link.concealed = this.value === null ? true : false;
    this.$link.label = this.markdown ? 'Hide preview' : 'Show preview';    
    this.$label.text = this.placeholder === null ? 'Notes' : this.placeholder;
    this.$description.text = this.description;    
    this.$description.hidden = this.description === null ? true : false;
    this.$notes.placeholder = this.placeholder === null ? 'Notes' : this.placeholder;
    this.$notes.readOnly = this.readOnly;
    this.$notes.helper = this.question;
    this.$notes.light = this.light;
    this.$notes.value = this.value;

    if( this.readOnly && this.value === null ) {
      this.markdown = false;
    }

    if( this.markdown ) {
      this.$markdown.innerHTML = marked.parse( this.value === null ? '' : this.value );    
    }
  }

  // Promote properties
  // Values may be set before module load
  _upgrade( property ) {
    if( this.hasOwnProperty( property ) ) {
      const value = this[property];
      delete this[property];
      this[property] = value;
    }
  }

  // Setup
  connectedCallback() {
    this._upgrade( 'concealed' );        
    this._upgrade( 'data' );                
    this._upgrade( 'disabled' );  
    this._upgrade( 'description' );                
    this._upgrade( 'helper' );                  
    this._upgrade( 'hidden' );    
    this._upgrade( 'icon' );        
    this._upgrade( 'label' );        
    this._upgrade( 'light' );            
    this._upgrade( 'markdown' );        
    this._upgrade( 'monospace' );            
    this._upgrade( 'placeholder' );                
    this._upgrade( 'readOnly' );        
    this._upgrade( 'value' );            
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'description',
      'disabled',
      'helper',      
      'hidden',
      'icon',
      'label',
      'light',
      'markdown',
      'monospace',
      'placeholder',
      'read-only',
      'value'
    ];
  }

  // Observed attribute has changed
  // Update render
  attributeChangedCallback( name, old, value ) {
    this._render();
  } 

  // Properties
  // Not reflected
  // Array, Date, Object, null
  get data() {
    return this._data;
  }

  set data( value ) {
    this._data = value;
  }

  // Attributes
  // Reflected
  // Boolean, Number, String, null
  get concealed() {
    return this.hasAttribute( 'concealed' );
  }

  set concealed( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'concealed' );
      } else {
        this.setAttribute( 'concealed', '' );
      }
    } else {
      this.removeAttribute( 'concealed' );
    }
  }

  get description() {
    if( this.hasAttribute( 'description' ) ) {
      return this.getAttribute( 'description' );
    }

    return null;
  }

  set description( value ) {
    if( value !== null ) {
      this.setAttribute( 'description', value );
    } else {
      this.removeAttribute( 'description' );
    }
  }  

  get disabled() {
    return this.hasAttribute( 'disabled' );
  }

  set disabled( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'disabled' );
      } else {
        this.setAttribute( 'disabled', '' );
      }
    } else {
      this.removeAttribute( 'disabled' );
    }
  }  

  get helper() {
    if( this.hasAttribute( 'helper' ) ) {
      return this.getAttribute( 'helper' );
    }

    return null;
  }

  set helper( value ) {
    if( value !== null ) {
      this.setAttribute( 'helper', value );
    } else {
      this.removeAttribute( 'helper' );
    }
  }        

  get hidden() {
    return this.hasAttribute( 'hidden' );
  }

  set hidden( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'hidden' );
      } else {
        this.setAttribute( 'hidden', '' );
      }
    } else {
      this.removeAttribute( 'hidden' );
    }
  }   

  get icon() {
    if( this.hasAttribute( 'icon' ) ) {
      return this.getAttribute( 'icon' );
    }

    return null;
  }

  set icon( value ) {
    if( value !== null ) {
      this.setAttribute( 'icon', value );
    } else {
      this.removeAttribute( 'icon' );
    }
  }   
  
  get label() {
    if( this.hasAttribute( 'label' ) ) {
      return this.getAttribute( 'label' );
    }

    return null;
  }

  set label( value ) {
    if( value !== null ) {
      this.setAttribute( 'label', value );
    } else {
      this.removeAttribute( 'label' );
    }
  }     

  get light() {
    return this.hasAttribute( 'light' );
  }

  set light( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'light' );
      } else {
        this.setAttribute( 'light', '' );
      }
    } else {
      this.removeAttribute( 'light' );
    }
  }    

  get markdown() {
    return this.hasAttribute( 'markdown' );
  }

  set markdown( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'markdown' );
      } else {
        this.setAttribute( 'markdown', '' );
      }
    } else {
      this.removeAttribute( 'markdown' );
    }
  }    

  get monospace() {
    return this.hasAttribute( 'monospace' );
  }

  set monospace( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'monospace' );
      } else {
        this.setAttribute( 'monospace', '' );
      }
    } else {
      this.removeAttribute( 'monospace' );
    }
  }  
  
  get placeholder() {
    if( this.hasAttribute( 'placeholder' ) ) {
      return this.getAttribute( 'placeholder' );
    }

    return null;
  }

  set placeholder( value ) {
    if( value !== null ) {
      this.setAttribute( 'placeholder', value );
    } else {
      this.removeAttribute( 'placeholder' );
    }
  }
  
  get readOnly() {
    return this.hasAttribute( 'read-only' );
  }

  set readOnly( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'read-only' );
      } else {
        this.setAttribute( 'read-only', '' );
      }
    } else {
      this.removeAttribute( 'read-only' );
    }
  }  

  get value() {
    if( this.hasAttribute( 'value' ) ) {
      return this.getAttribute( 'value' );
    }

    return null;
  }

  set value( value ) {
    if( value !== null ) {
      this.setAttribute( 'value', value );
    } else {
      this.removeAttribute( 'value' );
    }
  }       
}

window.customElements.define( 'adc-notes', AvocadoNotes );
