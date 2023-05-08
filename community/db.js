export const db = new Dexie( 'CommunityManager' );
db.version( 100 ).stores( {
  Members: 'id, fullName'
} );
