import AvocadoHBox from "../containers/hbox.js";
import AvocadoStack from "../containers/stack.js";

import AvocadoDrawer from "../containers/drawer.js";
import AvocadoDrawerItem from "../controls/drawer-item.js";
import AvocadoIcon from "../controls/icon.js";
import AvocadoLabel from "../controls/label.js";

import CommunityMembers from "./views/members/members.js";

import { v4 as uuidv4 } from "../lib/uuid-9.0.0.js";

import { db } from "./db.js";
import { store } from "./store.js";

export default class CommunityManager extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          position: relative;
          height: 100%;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        adc-drawer {
          min-width: 250px;
          width: 250px;
        }

        adc-drawer adc-hbox {
          align-items: center; 
          height: 32px;
          min-height: 32px;
        }

        adc-drawer adc-hbox adc-icon {
          margin: 0 12px 0 16px; 
          --icon-color: #f4f4f4;          
        }

        adc-drawer adc-hbox adc-label {
          --label-color: #f4f4f4; 
          --label-font-weight: 600;          
        }

        adc-drawer adc-hbox ~ adc-drawer-item::part( button ) {
          padding: 0 0 0 48px;
        }
  
        adc-stack {
          flex-basis: 0;
          flex-grow: 1;
        }
      </style>
      <adc-drawer>
        <adc-drawer-item>
          <adc-icon name="person" slot="prefix" weight="100"></adc-icon>
          Members
          <adc-label id="members" slot="suffix">0</adc-label>
        </adc-drawer-item>
        <adc-drawer-item>
          <adc-icon name="groups" slot="prefix" weight="100"></adc-icon>
          Organizations
          <adc-label id="meeting" slot="suffix">0</adc-label>
        </adc-drawer-item>
        <adc-drawer-item>
          <adc-icon name="handshake" slot="prefix" weight="100"></adc-icon>
          Activities
          <adc-label id="conversation" slot="suffix">0</adc-label>
        </adc-drawer-item>
        <adc-drawer-item>
          <adc-icon name="pin_drop" slot="prefix" weight="100"></adc-icon>
          Engagements
          <adc-label id="situation" slot="suffix">0</adc-label>
        </adc-drawer-item>
        <adc-hbox>
          <adc-icon name="inventory_2" weight="100"></adc-icon>
          <adc-label>Events</adc-label>
        </adc-hbox>        
        <adc-drawer-item>
          Participating
          <adc-label id="growth" slot="suffix">0</adc-label>
        </adc-drawer-item>                  
        <adc-drawer-item>
          Tracking
          <adc-label id="growth" slot="suffix">0</adc-label>
        </adc-drawer-item>   
        <adc-hbox>
          <adc-icon name="inventory_2" weight="100"></adc-icon>
          <adc-label>Rules</adc-label>
        </adc-hbox>                                       
        <adc-drawer-item>
          Activity Types
          <adc-label id="action" slot="suffix">0</adc-label>
        </adc-drawer-item>              
        <adc-drawer-item>
          Reach Elements
          <adc-label id="action" slot="suffix">0</adc-label>
        </adc-drawer-item>                      
        <adc-drawer-item>
          Levels
          <adc-label id="action" slot="suffix">0</adc-label>
        </adc-drawer-item>                      
        <adc-hbox>
          <adc-icon name="inventory_2" weight="100"></adc-icon>
          <adc-label>Resources</adc-label>
        </adc-hbox>
        <adc-drawer-item>Colors</adc-drawer-item>                
        <adc-drawer-item>Contributions</adc-drawer-item>        
        <adc-drawer-item>Industries</adc-drawer-item>                        
        <adc-drawer-item>Languages</adc-drawer-item>                                
        <adc-drawer-item>Regions</adc-drawer-item>                                
        <adc-drawer-item>Relationships</adc-drawer-item>                                        
        <adc-drawer-item>Roles</adc-drawer-item>                                
        <adc-drawer-item>Situations</adc-drawer-item>                                        
        <adc-drawer-item>Technologies</adc-drawer-item>                                        
      </adc-drawer>
      <adc-stack>
        <acm-members read-only></acm-members>
      </adc-stack>
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$drawer = this.shadowRoot.querySelector( 'adc-drawer' );
    this.$drawer.addEventListener( 'change', ( evt ) => {
      this.$stack.selectedIndex = evt.detail.selectedIndex
      window.localStorage.setItem( 'community_drawer_index', evt.detail.selectedIndex );
    } );
    this.$stack = this.shadowRoot.querySelector( 'adc-stack' );
    
    this.$members_count = this.shadowRoot.querySelector( 'adc-label[id=members]' );        

    this.$members = this.shadowRoot.querySelector( 'acm-members' );

    // State
    const drawer_index = window.localStorage.getItem( 'community_drawer_index' ) === null ? 0 : parseInt( window.localStorage.getItem( 'community_drawer_index' ) )
    this.$stack.selectedIndex = this.$drawer.selectedIndex = drawer_index;

    store.members.subscribe( ( data ) => this.$members_count.text = data.length );    

    // Database
    /*
    db.Type.toArray().then( ( data ) => {
      if( data.length === 0 ) {
        fetch( '/remote/defaults.json' )
        .then( ( response ) => response.json() )
        .then( async ( data ) => {
          for( const store in data ) {
            const bulk = [];
            for( let s = 0; s < data[store].length; s++ ) {
              bulk.push( {
                id: uuidv4(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                name: data[store][s]
              } );
            }
            await db[store].bulkPut( bulk );
          }
        } );
      }
    } );
    */
  }

  async backup() {
    const backup = {};
    await Promise.all( db.tables.map( async ( table ) => {
      backup[table.name] = await db[table.name].toArray();
    } ) ).then( () => {
      const a = document.createElement( 'a' );
      const blob = new Blob( [JSON.stringify( backup )], {type: 'application/json'} );
      const url = URL.createObjectURL( blob );
      a.setAttribute( 'href', url );
      a.setAttribute( 'download', 'remote.json' );
      document.body.appendChild( a );
      a.click();
      document.body.removeChild( a );    
    } );
  }

   // When attributes change
  _render() {;}

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
    this._upgrade( 'hidden' );    
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'hidden'
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
}

window.customElements.define( 'acm-manager', CommunityManager );
