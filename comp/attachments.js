import AvocadoHBox from "../containers/hbox.js";
import AvocadoVBox from "../containers/vbox.js";

import AvocadoButton from "../controls/button.js";
import AvocadoColumn from "../controls/column.js";
import AvocadoIcon from "../controls/icon.js";
import AvocadoInput from "../controls/input.js";
import AvocadoLabel from "../controls/label.js";
import AvocadoTable from "../controls/table.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";

export default class AvocadoAttachments extends HTMLElement {
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

        div[id=divider] {
          align-items: center;
          background-color: #0f62fe;
          display: flex;
          flex-direction: row;
          height: 48px;
        }

        div[id=divider] div {
          background-color: #ffffff;
          height: 15px;
          width: 1px;
        }

        adc-button[disabled] adc-icon {
          --icon-color: #8d8d8d;
        }

        adc-hbox {
          height: 48px;
          justify-content: flex-end;
          min-height: 48px;
          transition: transform 150ms ease-in-out;
        }

        adc-input {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-input::part( error ) {
          display: none;
        }

        adc-input::part( input ) {
          height: 48px;
        }        

        adc-input::part( field ) {
          border-bottom: none;
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

        adc-vbox[id=header] {
          height: 48px;
          max-height: 48px;          
          min-height: 48px;
          overflow: hidden;
        }        

        adc-vbox[id=header] adc-hbox:last-of-type {
          align-items: center;          
          background-color: #0f62fe;
          padding: 0 0 0 15px;
        }

        adc-vbox[id=header] adc-label {
          flex-basis: 0;
          flex-grow: 1;
          --label-color: #ffffff;
        }

        adc-vbox.selected adc-hbox:first-of-type {
          transform: translateY( 48px );
        }

        adc-vbox.selected adc-hbox:last-of-type {
          transform: translateY( -48px );
        }        

        input {
          display: none;
          -webkit-tap-highlight-color: transparent;
        }        

        #cancel::part( button ) {
          padding: 0 15px 0 15px;
        }
      </style>
      <adc-vbox id="header">
        <adc-hbox>
          <adc-input 
            placeholder="Filter by attachment name" 
            size="lg" 
            type="search">
            <adc-icon name="search" slot="prefix"></adc-icon>
          </adc-input>
          <adc-button id="upload" label="Upload">
            <adc-icon name="upload_file" slot="suffix"></adc-icon>          
          </adc-button>
        </adc-hbox>
        <adc-hbox>
          <adc-label>1 file selected</adc-label>
          <adc-button id="delete" label="Delete">
            <adc-icon name="delete" slot="suffix"></adc-icon>
          </adc-button>
          <adc-button id="download" label="Download">
            <adc-icon name="download" slot="suffix"></adc-icon>
          </adc-button>                                                      
          <div id="divider">
            <div></div>
          </div>
          <adc-button id="cancel" label="Cancel"></adc-button>
        </adc-hbox>
      </adc-vbox>
      <adc-table light selectable sortable>
        <adc-column 
          header-text="Attachment Name"
          label-field="name"
          sortable>
        </adc-column>
        <adc-column 
          header-text="Last Modified"
          label-field="modified"
          sortable
          width="250">
        </adc-column>
        <adc-column
          header-text="Size" 
          label-field="size"
          sortable
          width="150">
        </adc-column>   
        <adc-vbox slot="empty">
          <adc-label>No attachments added yet.</adc-label>
        </adc-vbox>                     
      </adc-table>
      <input type="file" />
    `;

    // Private
    this._data = null;
    this._files = [];

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$cancel  = this.shadowRoot.querySelector( '#cancel' );
    this.$cancel.addEventListener( 'click', () => {
      this.$table.selectedIndices = null;
      this.$header.classList.remove( 'selected' );
    } );
    this.$delete = this.shadowRoot.querySelector( '#delete' );
    this.$delete.addEventListener( 'click', () => {
      this.$header.classList.remove( 'selected' );
      this._files.splice( this._index, 1 );
      this.label = `Attachments (${this._files.length})`;    
      this._index = null;
      this.$header.classList.remove( 'selected' );  
      this.$table.selectedItems = null;
      this.$table.provider = this._files;
    } );
    this.$download = this.shadowRoot.querySelector( '#download' );
    this.$download.addEventListener( 'click', () => {
      const a = document.createElement( 'a' );
      a.classList.add( 'download' );
      a.setAttribute( 'href', url );
      a.setAttribute( 'download', this.$table.selectedItems[0].name );
      document.body.appendChild( a );
      a.click();
      document.body.removeChild( a );
    } );
    this.$file = this.shadowRoot.querySelector( 'adc-button' );
    this.$header = this.shadowRoot.querySelector( '#header' );    
    this.$input = this.shadowRoot.querySelector( 'input' );
    this.$input.addEventListener( 'change', async () => {
      for( let f  = 0; f < this.$input.files.length; f++ ) {
        const data = await this.read( this.$input.files[f] );
        this._files.push( {
          id: uuidv4(),
          data: data,
          name: this.$input.files[f].name,
          modified: this.$input.files[f].lastModified,
          size: this.$input.files[f].size,
          format: this.$input.files[f].type          
        } );
      }

      this.label = `Attachments (${this._files.length})`;    
      this.$table.provider = this._files;              
    } );    
    this.$name = this.shadowRoot.querySelector( 'adc-column:nth-of-type( 1 )' );
    this.$name.sortCompareFunction = ( a, b ) => {
      if( a.name > b.name ) return 1;
      if( a.name < b.name ) return -1;
      return 0;
    };            
    this.$modified = this.shadowRoot.querySelector( 'adc-column:nth-of-type( 2 )' );
    this.$modified.labelFunction = ( value ) => {
      const modified = new Date( value.modified );

      const date = new Intl.DateTimeFormat( navigator.language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      } ).format( modified );    
      const time = new Intl.DateTimeFormat( navigator.language, {
        hour: 'numeric',
        minute: '2-digit'
      } ).format( modified );    

      return `${date} @ ${time}`;
    };
    this.$modified.sortCompareFunction = ( a, b ) => {
      if( a.modified > b.modified ) return 1;
      if( a.modified < b.mondified ) return -1;
      return 0;
    };        
    this.$search = this.shadowRoot.querySelector( 'adc-input' );
    this.$search.addEventListener( 'clear', () => {
      this.$table.provider = this._files;
    } );
    this.$search.addEventListener( 'input', ( evt ) => {
      if( evt.currentTarget.value === null ) return;

      this.$table.provider = this._files.filter( ( item ) => {
        return item.name.toLowerCase().indexOf( evt.currentTarget.value.toLowerCase() ) >= 0 ? true : false;
      } );
    } );
    this.$size = this.shadowRoot.querySelector( 'adc-column:nth-of-type( 3 )' );
    this.$size.labelFunction = ( value ) => {
      if( value.size == 0 ) return '0';

      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];      
      const i = parseInt( Math.floor( Math.log( value.size ) / Math.log( 1024 ) ), 10 );

      if( i === 0 ) return `${value.size} ${sizes[i]}`;
      
      return `${( value.size / ( 1024 ** i ) ).toFixed( 1 )} ${sizes[i]}`;      
    };
    this.$size.sortCompareFunction = ( a, b ) => {
      if( a.size > b.size ) return 1;
      if( a.size < b.size ) return -1;
      return 0;
    };            
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => {
      this._index = evt.detail.selectedIndex;

      if( this.$table.selectedIndices.length > 0 ) {
        this.$header.classList.add( 'selected' );
      } else {
        this.$header.classList.remove( 'selected' );
      }
    } );
    this.$table.provider = this._files;
    this.$upload = this.shadowRoot.querySelector( '#upload' );
    this.$upload.addEventListener( 'click', () => {
      this.$input.click();
    } );
  }

  read( file ) {
    return new Promise( ( resolve, reject ) => {
      const reader = new FileReader();
      reader.addEventListener( 'load', ( evt ) => {
        resolve( evt.target.result );
      } );
      reader.readAsDataURL( file );
    } );
  }

   // When attributes change
  _render() {
    this.$upload.disabled = this.readOnly;
    this.$delete.hidden = this.readOnly;
    this.$download.hidden = !this.readOnly;
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
    return this._files.length === 0 ? null : this._files;
  }

  set value( data ) {
    if( data === null ) {
      this._files = [];
    } else {
      this._files = [... data];
    }

    this.$search.value = null;
    this.$header.classList.remove( 'selected' );
    this.$table.selectedItems = null;
    this.$table.provider = this._files;
    this.label = `Attachments (${this._files.length})`;
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

window.customElements.define( 'adc-attachments', AvocadoAttachments );
