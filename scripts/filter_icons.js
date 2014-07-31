/*
	Unused keys can be remove commented out or deleted
*/
function expiresdate() {
	var exp = new Date();
	exp.setTime(exp.getTime() + (1/*years*/ * 365/*days*/ * 24/*hours*/ * 60/*minutes*/ * 60/*seconds*/ *1000/*milliseconds*/)); // ~1 year	
	return exp.toGMTString();
}
var filter_icons = {

	//aditional info to save with cookies (selected & opened)
	'cookie_ext':'expires='+expiresdate()+';',
	
	//allow several items to be selected
	'multiselections':true,
	
	//use cookies to maintain state
	'keep_states':true, 

	'b_solid':true, //if true will significantly effect appearance delay of the control on huge hierarchy

	// icons - root leaf
	'icon_32':'/images/icons/treeicons/box.gif',   // root leaf icon normal
	'icon_36':'/images/icons/treeicons/tick.gif',   // root leaf icon selected
	'icon_96':'/images/icons/treeicons/box.gif',   // root leaf icon over
	'icon_100':'/images/icons/treeicons/tick.gif',   // root leaf icon selected over

	// icons - node	
	'icon_16':'/images/icons/treeicons/box.gif', // node icon normal
	'icon_20':'/images/icons/treeicons/tick.gif', // node icon selected
	'icon_24':'/images/icons/treeicons/box.gif', // node icon opened
	'icon_28':'/images/icons/treeicons/tick.gif', // node icon selected opened
	'icon_80':'/images/icons/treeicons/box.gif', //  node icon  over
	'icon_84':'/images/icons/treeicons/tick.gif', //  selected node icon  over
	'icon_88':'/images/icons/treeicons/box.gif', //  open node icon  over
	'icon_92':'/images/icons/treeicons/tick.gif', //  selected open node icon  over

	// icons - leaf
	'icon_0':'/images/icons/treeicons/box.gif', // leaf icon normal
	'icon_4':'/images/icons/treeicons/tick.gif', // leaf icon selected
	'icon_64':'/images/icons/treeicons/box.gif', // leaf icon over
	'icon_68':'/images/icons/treeicons/tick.gif', // leaf icon selected over
	
	// icons - junctions	
	'icon_2':'/images/icons/treeicons/empty.gif', // junction for leaf
	'icon_3':'/images/icons/treeicons/empty.gif',       // junction for last leaf
	'icon_18':'/images/icons/treeicons/plus.gif', // junction for closed node
	'icon_19':'/images/icons/treeicons/plus.gif',       // juntion for last closed node
	'icon_26':'/images/icons/treeicons/minus.gif',// junction for opened node
	'icon_27':'/images/icons/treeicons/minus.gif',      // junction for last opened node

	// icons - misc
	'icon_e':'/images/icons/treeicons/empty.gif', // empty image
	'icon_l':'/images/icons/treeicons/empty.gif',  // vertical line

	// styles - root
	'style_48':'mout', // normal root caption style
	'style_52':'mout', // selected root caption style
	'style_56':'mout', // opened root caption style
	'style_60':'mout', // selected opened root caption style
	'style_112':'mover', // mouseovered normal root caption style
	'style_116':'mover', // mouseovered selected root caption style
	'style_120':'mover', // mouseovered opened root caption style
	'style_124':'mover', // mouseovered selected opened root caption style
	
	// styles - node
	'style_16':'mout', // normal node caption style
	'style_20':'mout', // selected node caption style
	'style_24':'mout', // opened node caption style
	'style_28':'mout', // selected opened node caption style
	'style_80':'mover', // mouseovered normal node caption style
	'style_84':'mover', // mouseovered selected node caption style
	'style_88':'mover', // mouseovered opened node caption style
	'style_92':'mover', // mouseovered selected opened node caption style

	// styles - leaf
	'style_0':'mout', // normal leaf caption style
	'style_4':'mout', // selected leaf caption style
	'style_64':'mover', // mouseovered normal leaf caption style
	'style_68':'mover', // mouseovered selected leaf caption style

	'userJoinEvent': {
		'oncontextmenu':'return h_context_menu(o_tree_item)'
	},
	'userIconEvent': {
		'oncontextmenu':'return h_context_menu(o_tree_item)'
	},
	'userTextEvent': {
		'oncontextmenu':'return h_context_menu(o_tree_item)',
		'style':'color:000000'
	},
	
	'onItemSelect': 'tre_onItemSelectHandler',	
	'onItemDeselect': 'tre_onItemDeselectHandler'
	
};
