import AvocadoHBox from "../../../containers/hbox.js";

import AvocadoButton from "../../../controls/button.js";
import AvocadoColumn from "../../../controls/column.js";
import AvocadoDatePicker from "../../../controls/date-picker.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoSelect from "../../../controls/select.js";
import AvocadoTable from "../../../controls/table.js";

import { store } from "../../store.js";

export default class RemoteGrowthObjectives extends HTMLElement {
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
          padding: 16px 16px 16px 16px;
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

        adc-controls {
          padding: 0 0 20px 0;
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
        
        adc-vbox[slot=empty] {
          align-items: center;
          background-color: #ffffff;
          flex-basis: 0;
          flex-grow: 1;
          justify-content: center;
        }

        adc-vbox[slot=empty] adc-label {
          --label-color: #525252;
        }        
      </style>
      <adc-hbox>
        <adc-input
          helper="Specific, measurable, actionable, relevant, time-bound"
          id="smart"
          label="Goal name"
          light
          placeholder="Goal name">
        </adc-input>              
        <adc-date-picker
          helper="Projected completion"
          id="plan"
          label="Plan date"
          light
          placeholder="Plan date"
          style="flex-grow: 0; min-width: 165px;">
        </adc-date-picker>           
        <adc-select
          helper="Degree of completion"
          id="status"
          label="Status"
          label-field="name"
          light
          placeholder="Status"
          style="flex-grow: 0; min-width: 165px;">
        </adc-select>                    
      </adc-hbox>
      <adc-hbox>
        <adc-input
          id="description"
          label="Description"
          light
          placeholder="Description">
        </adc-input>              
        <adc-select
          id="complexity"
          label="Complexity"
          light
          placeholder="Complexity"
          style="flex-grow: 0; min-width: 165px;">
        </adc-select>                           
        <adc-select
          id="impact"
          label="Impact"
          light
          placeholder="Impact"
          style="flex-grow: 0; min-width: 165px;">
        </adc-select>                    
      </adc-hbox>            
      <adc-controls></adc-controls>
      <adc-table light>
        <adc-column header-text="Goal name" sortable></adc-column>
        <adc-column header-text="Plan date" sortable width="200"></adc-column>        
        <adc-column header-text="Status" sortable width="200"></adc-column>                
        <adc-vbox slot="empty">
          <adc-label>No goals added yet.</adc-label>
        </adc-vbox>        
      </adc-table>
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Element
    this.$add = this.shadowRoot.querySelector( 'adc-button' );
    this.$add.addEventListener( 'click', () => {
      console.log( this.value );
    } );
    this.$smart = this.shadowRoot.querySelector( '#smart' );
    this.$plan = this.shadowRoot.querySelector( '#plan' );
    this.$status = this.shadowRoot.querySelector( '#status' );
    this.$description = this.shadowRoot.querySelector( '#description' );
    this.$complexity = this.shadowRoot.querySelector( '#complexity' );
    this.$complexity.provider = ['None', 'Low', 'Medium', 'High'];
    this.$impact = this.shadowRoot.querySelector( '#impact' );
    this.$impact.provider = ['None', 'Low', 'Medium', 'High'];
    this.$table = this.shadowRoot.querySelector( 'adc-table' );

    store.status.subscribe( ( data ) => this.$status.provider = data );    
    
    this.readOnly = true;
  }

  clear() {
    this.value = null;
  }

  // When attributes change
  _render() {
    this.$smart.readOnly = this.readOnly;
    this.$plan.readOnly = this.readOnly;
    this.$status.readOnly = this.readOnly;
    this.$description.readOnly = this.readOnly;
    this.$complexity.readOnly = this.readOnly;
    this.$impact.readOnly = this.readOnly;
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
      smart: this.$smart.value,
      planAt: this.$plan.value.getTime(),
      status: this.$status.value.id,
      description: this.$description.value,
      complexity: this.$complexity.value,
      impact: this.$impact.value
    };
  }

  set value( item ) {
    if( item === null ) {
      this.$smart.value = null;
      this.$plan.value = null;
      this.$status.selectedItem = null;
      this.$description.value = null;
      this.$complexity.selectedItem = null;
      this.$impact.selectedItem = null;
    } else {
      this.$smart.value = item.smart;
      this.$plan.value = new Date( item.planAt );
      this.$status.selectedItem = {id: item.status};
      this.$description.value = item.description;
      this.$complexity.selectedItem = item.complexity;
      this.$impact.selectedItem = item.impact;
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

window.customElements.define( 'arm-growth-objectives', RemoteGrowthObjectives );
