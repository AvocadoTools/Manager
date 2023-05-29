export default class RemoteGoals extends HTMLElement {
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
          padding: 16px 16px 26px 16px;
          position: relative;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        adc-button {
          margin: 0 0 24px 0;
        }

        adc-hbox {
          align-items: flex-end;
          gap: 16px;
        }

        adc-input {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-table {
          flex-basis: 0;
          flex-grow: 1;
        }        
      </style>
      <adc-hbox>
        <adc-input
          helper="A single point stating long-term interests"
          id="name"
          label="Description"
          light
          placeholder="Description"
          value="Interested in a research role">
        </adc-input>              
        <adc-date-picker
          helper="Projected completion"
          id="complete"
          label="Plan date"
          light
          placeholder="Plan date"
          style="flex-grow: 0; min-width: 200px;">
        </adc-date-picker>           
        <adc-select
          helper="Degree of completion"
          id="status"
          label="Status"
          light
          placeholder="Status"
          style="flex-grow: 0; min-width: 200px;">
        </adc-select>                    
      </adc-hbox>
      <adc-hbox>
        <adc-button kind="secondary" size="md">Add goal</adc-button>      
      </adc-hbox>
      <adc-table light>
        <adc-column sortable>Description</adc-column>
        <adc-column sortable width="181">Plan date</adc-column>        
        <adc-column sortable width="165">Status</adc-column>                
      </adc-table>
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Element
    this.$name = this.shadowRoot.querySelector( '#name' );
    this.$complete = this.shadowRoot.querySelector( '#complete' );
    this.$status = this.shadowRoot.querySelector( '#status' );
    this.$description = this.shadowRoot.querySelector( '#description' );
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
  }
  
  clear() {
    this.value = null;
  }

   // When attributes change
  _render() {
    this.$attendee.readOnly = this.readOnly;
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
    this._upgrade( 'helper' );
    this._upgrade( 'hidden' );
    this._upgrade( 'icon' );
    this._upgrade( 'label' );
    this._upgrade( 'readOnly' );
    this._upgrade( 'value' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'disabled',
      'helper',
      'hidden',
      'icon',
      'label',
      'read-only'
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

  get value() {
    return {
      smart: this.$name.value,
      completeAt: this.$complete.value,
      status: this.$status.value.id,
      description: this.$description.value,
      complexity: this.$complexity.value.id,
      impact: this.$impact.value.id
    };
  }

  set value( item ) {
    if( item === null ) {
      this.$name.value = null;
      this.$complete.value = null;
      this.$status.selectedItem = null;
      this.$description.value = null;
      this.$complexity.selectedItem = null;
      this.$impact.selectedItem = null;
    } else {
      this.$name.value = item.name;
      this.$complete.value = item.completeAt;
      this.$status.selectedItem = {id: item.status};
      this.$description.value = item.description;
      this.$complexity.selectedItem = {id: item.complexity};
      this.$impact.selectedItem = {id: item.impact};
    }
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
}

window.customElements.define( 'arm-goals', RemoteGoals );
