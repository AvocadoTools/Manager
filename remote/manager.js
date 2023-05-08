import AvocadoHBox from "../containers/hbox.js";
import AvocadoStack from "../containers/stack.js";

import AvocadoDrawer from "../containers/drawer.js";
import AvocadoDrawerItem from "../controls/drawer-item.js";
import AvocadoIcon from "../controls/icon.js";
import AvocadoLabel from "../controls/label.js";

import RemoteAction from "./views/action/action.js";
import RemoteDocument from "./views/document/document.js";
import RemoteGrowth from "./views/growth/growth.js";
import RemoteLink from "./views/link/link.js";
import RemoteMeeting from "./views/meeting/meeting.js";
import RemoteOneOnOne from "./views/one-on-one/one-on-one.js";
import RemotePerson from "./views/person/person.js";
import RemoteResource from "./resource.js";
import RemoteSituation from "./views/situation/situation.js";

import { v4 as uuidv4 } from "../lib/uuid-9.0.0.js";

import { db } from "./db.js";
import { store } from "./store.js";

export default class RemoteManager extends HTMLElement {
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
          Person
          <adc-label id="person" slot="suffix">0</adc-label>
        </adc-drawer-item>
        <adc-drawer-item>
          <adc-icon name="groups" slot="prefix" weight="100"></adc-icon>
          Meeting
          <adc-label id="meeting" slot="suffix">0</adc-label>
        </adc-drawer-item>
        <adc-drawer-item>
          <adc-icon name="handshake" slot="prefix" weight="100"></adc-icon>
          1:1
          <adc-label id="conversation" slot="suffix">0</adc-label>
        </adc-drawer-item>
        <adc-drawer-item>
          <adc-icon name="pin_drop" slot="prefix" weight="100"></adc-icon>
          Situation
          <adc-label id="situation" slot="suffix">0</adc-label>
        </adc-drawer-item>
        <adc-drawer-item>
          <adc-icon name="spa" slot="prefix" weight="100"></adc-icon>
          Growth
          <adc-label id="growth" slot="suffix">0</adc-label>
        </adc-drawer-item>                  
        <adc-drawer-item>
          <adc-icon name="checklist" slot="prefix" weight="100"></adc-icon>
          Action
          <adc-label id="action" slot="suffix">0</adc-label>
        </adc-drawer-item>              
        <adc-drawer-item>
          <adc-icon name="description" slot="prefix" weight="100"></adc-icon>
          Document
          <adc-label id="document" slot="suffix">0</adc-label>
        </adc-drawer-item>          
        <adc-drawer-item>
          <adc-icon name="link" slot="prefix" weight="100"></adc-icon>
          Link
          <adc-label id="link" slot="suffix">0</adc-label>
        </adc-drawer-item>                   
        <adc-drawer-item>
          <adc-icon name="attachment" slot="prefix" weight="100"></adc-icon>
          Attachment
          <adc-label id="action" slot="suffix">0</adc-label>
        </adc-drawer-item>               
        <adc-hbox>
          <adc-icon name="inventory_2" weight="100"></adc-icon>
          <adc-label>Resources</adc-label>
        </adc-hbox>
        <adc-drawer-item>Priorities</adc-drawer-item>                
        <adc-drawer-item>Rooms</adc-drawer-item>        
        <adc-drawer-item>Status</adc-drawer-item>                        
        <adc-drawer-item>Tags</adc-drawer-item>                                
        <adc-drawer-item>Types</adc-drawer-item>                                
      </adc-drawer>
      <adc-stack>
        <arm-person read-only></arm-person>
        <arm-meeting read-only></arm-meeting>
        <arm-one-on-one read-only></arm-one-on-one>
        <arm-situation read-only></arm-situation>        
        <arm-growth></arm-growth>
        <arm-action read-only></arm-action>      
        <arm-document read-only></arm-document>                              
        <arm-link read-only></arm-link>              
        <arm-action></arm-action>                      
        <arm-resource 
          data-type="Priority"
          helper="Priorities used for action items." 
          label="Priorities"
          name="priorities"
          read-only>
          No priorities added yet.
        </arm-resource>                
        <arm-resource 
          data-type="Room"        
          helper="Meeting rooms wether physical or virtual." 
          label="Rooms"
          name="rooms"
          read-only>
          No rooms added yet.
        </arm-resource>                                    
        <arm-resource 
          data-type="Status"
          helper="Status used for action items." 
          label="Status"
          name="status"
          read-only>
          No status added yet.
        </arm-resource>                                  
        <arm-resource 
          data-type="Tag"
          helper="Generic, ad hoc, categorization." 
          label="Tags"
          name="tags"
          read-only>
        </arm-resource>                                                  
        <arm-resource 
          data-type="Type"
          helper="Meeting types defining group size and scope." 
          label="Types"
          name="types"
          read-only>
        </arm-resource>                                          
        <arm-resource label="Types"></arm-resource>                  
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
      window.localStorage.setItem( 'drawer_index', evt.detail.selectedIndex );
    } );
    
    this.$action_count = this.shadowRoot.querySelector( 'adc-label[id=action]' )
    this.$conversation_count = this.shadowRoot.querySelector( 'adc-label[id=conversation]' );      
    this.$document_count = this.shadowRoot.querySelector( 'adc-label[id=document]' );    
    this.$link_count = this.shadowRoot.querySelector( 'adc-label[id=link]' );      
    this.$meeting_count = this.shadowRoot.querySelector( 'adc-label[id=meeting]' );        
    this.$person_count = this.shadowRoot.querySelector( 'adc-label[id=person]' );        
    this.$situation_count = this.shadowRoot.querySelector( 'adc-label[id=situation]' );

    this.$action = this.shadowRoot.querySelector( 'arm-action' );
    this.$conversation = this.shadowRoot.querySelector( 'arm-one-on-one' );
    this.$document = this.shadowRoot.querySelector( 'arm-document' );    
    this.$link = this.shadowRoot.querySelector( 'arm-link' );
    this.$meeting = this.shadowRoot.querySelector( 'arm-meeting' );    
    this.$person = this.shadowRoot.querySelector( 'arm-person' );
    this.$priorities = this.shadowRoot.querySelector( 'arm-resource[name=priorities]' );    
    this.$rooms = this.shadowRoot.querySelector( 'arm-resource[name=rooms]' );
    this.$stack = this.shadowRoot.querySelector( 'adc-stack' );
    this.$status = this.shadowRoot.querySelector( 'arm-resource[name=status]' );    
    this.$tags = this.shadowRoot.querySelector( 'arm-resource[name=tags]' );    
    this.$types = this.shadowRoot.querySelector( 'arm-resource[name=types]' );

    // State
    const drawer_index = window.localStorage.getItem( 'drawer_index' ) === null ? 0 : parseInt( window.localStorage.getItem( 'drawer_index' ) )
    this.$stack.selectedIndex = this.$drawer.selectedIndex = drawer_index;

    store.action.subscribe( ( data ) => this.$action_count.text = data.length );    
    store.conversation.subscribe( ( data ) => this.$conversation_count.text = data.length );    
    store.document.subscribe( ( data ) => this.$document_count.text = data.length );                
    store.link.subscribe( ( data ) => this.$link_count.text = data.length );    
    store.meeting.subscribe( ( data ) => this.$meeting_count.text = data.length );    
    store.person.subscribe( ( data ) => this.$person_count.text = data.length );    
    store.situation.subscribe( ( data ) => this.$situation_count.text = data.length );                

    // Database
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

    // Read
    db.Action.orderBy( 'dueAt' ).toArray().then( ( data ) => store.action.set( data ) );        
    db.Person.orderBy( 'fullName' ).toArray().then( ( data ) => store.person.set( data ) );    
    db.Priority.orderBy( 'name' ).toArray().then( ( data ) => store.priority.set( data ) );
    db.Room.orderBy( 'name' ).toArray().then( ( data ) => store.room.set( data ) );
    db.Status.orderBy( 'name' ).toArray().then( ( data ) => store.status.set( data ) );    
    db.Tag.orderBy( 'name' ).toArray().then( ( data ) => store.tag.set( data ) );
    db.Type.orderBy( 'name' ).toArray().then( ( data ) => store.type.set( data ) );
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

window.customElements.define( 'arm-manager', RemoteManager );
