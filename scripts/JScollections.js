//////////////////////////////////////////////////////
// File: vector.js
//
// Author: Jason Geissler
// 
// Date: Sept 3, 2003
//
// Purpose: To have a dynamic collection instead
//          of using arrays when the total quantity
//          is unknown
//////////////////////////////////////////////////////

// Vector Constructor -- constructs the object
function Vector(inc) {
	if (inc == 0) {
		inc = 100;
	}
	
	/* Properties */
	this.data = new Array(inc);
	this.increment = inc;
	this.size = 0;
	
	/* Methods */
	this.getCapacity = getCapacity;
	this.getSize = getSize;
	this.isEmpty = isEmpty;
	this.getLastElement = getLastElement;
	this.getFirstElement = getFirstElement;
	this.getElementAt = getElementAt;
	this.addElement = addElement;
	this.insertElementAt = insertElementAt;
	this.removeElementAt = removeElementAt;
	this.removeAllElements = removeAllElements;
	this.indexOf = indexOf;
	this.contains = contains
	this.resize = resize;
	this.toString = toString;
	this.sort = sort;
	this.trimToSize = trimToSize;
	this.clone = clone;
	this.overwriteElementAt;
}

// getCapacity() -- returns the number of elements the vector can hold
function getCapacity() {
	return this.data.length;
}

// getSize() -- returns the current size of the vector
function getSize() {
	return this.size;
}

// isEmpty() -- checks to see if the Vector has any elements
function isEmpty() {
	return this.getSize() == 0;
}

// getLastElement() -- returns the last element
function getLastElement() {
	if (this.data[this.getSize() - 1] != null) {
		return this.data[this.getSize() - 1];
	}
}

// getFirstElement() -- returns the first element
function getFirstElement() {
	if (this.data[0] != null) {
		return this.data[0];
	}
}

// getElementAt() -- returns an element at a specified index
function getElementAt(i) {
	try {
		return this.data[i];
	} 
	catch (e) {
		return "Exception " + e + " occured when accessing " + i;	
	}	
}

// addElement() -- adds a element at the end of the Vector
function addElement(obj) {
	if(this.getSize() == this.data.length) {
		this.resize();
	}
	this.data[this.size++] = obj;
}

// insertElementAt() -- inserts an element at a given position
function insertElementAt(obj, index) {
	try {
		if (this.size == this.capacity) {
			this.resize();
		}
		
		for (var i=this.getSize(); i > index; i--) {
			this.data[i] = this.data[i-1];
		}
		this.data[index] = obj;
		this.size++;
	}
	catch (e) {
		return "Invalid index " + i;
	}
}

// removeElementAt() -- removes an element at a specific index
function removeElementAt(index) {
	try {
		var element = this.data[index];
		
		for(var i=index; i<(this.getSize()-1); i++) {
			this.data[i] = this.data[i+1];
		}
		
		this.data[getSize()-1] = null;
		this.size--;
		return element;
	}
	catch(e) {
		return "Invalid index " + index;
	}
} 

// removeAllElements() -- removes all elements in the Vector
function removeAllElements() {
	this.size = 0;
	
	for (var i=0; i<this.data.length; i++) {
		this.data[i] = null;
	}
}

// indexOf() -- returns the index of a searched element
function indexOf(obj) {
	for (var i=0; i<this.getSize(); i++) {
		if (this.data[i] == obj) {
			return i;
		}
	}
	return -1;
}

// contains() -- returns true if the element is in the Vector, otherwise false
function contains(obj) {
	for (var i=0; i<this.getSize(); i++) {
		if (this.data[i] == obj) {
			return true;
		}
	}
	return false;
}

// resize() -- increases the size of the Vector
function resize() {
	newData = new Array(this.data.length + this.increment);

	for	(var i=0; i< this.data.length; i++) {
		newData[i] = this.data[i];
	}
	
	this.data = newData;
}


// trimToSize() -- trims the vector down to it's size
function trimToSize() {
	var temp = new Array(this.getSize());
	
	for (var i = 0; i < this.getSize(); i++) {
		temp[i] = this.data[i];
	}
	this.size = temp.length - 1;
	this.data = temp;
} 

// sort() - sorts the collection based on a field name - f
function sort(f) {
	var i, j;
	var currentValue;
	var currentObj;
	var compareObj;
	var compareValue;
	
	for(i=1; i<this.getSize();i++) {
		currentObj = this.data[i];
		currentValue = currentObj[f];
		
		j= i-1;
		compareObj = this.data[j];
		compareValue = compareObj[f];
		
		while(j >=0 && compareValue > currentValue) {
			this.data[j+1] = this.data[j];
			j--;
			if (j >=0) {
				compareObj = this.data[j];
				compareValue = compareObj[f];
			}				
		}	
		this.data[j+1] = currentObj;
	}
}

// clone() -- copies the contents of a Vector to another Vector returning the new Vector.
function clone() {
	var newVector = new Vector(this.size);
	
	for (var i=0; i<this.size; i++) {
		newVector.addElement(this.data[i]);
	}
	
	return newVector;
}

// toString() -- returns a string rep. of the Vector
function toString() {
	var str = "Vector Object properties:\n" +
	          "Increment: " + this.increment + "\n" +
	          "Size: " + this.size + "\n" +
	          "Elements:\n";
	
	for (var i=0; i<getSize(); i++) {
		for (var prop in this.data[i]) {
			var obj = this.data[i];
			str += "\tObject." + prop + " = " + obj[prop] + "\n";
		}
	}
	return str;	
}

// overwriteElementAt() - overwrites the element with an object at the specific index.
function overwriteElementAt(obj, index) {
	this.data[index] = obj;
}



//////////////////////////////////////////////////////
// File: Matrix.js
//
// Author: Jason Geissler
// 
// Date: March 9, 2004
//
// Purpose: To have a multidimensional dynamic collection instead
//          of using arrays when the total quantity
//          is unknown
//////////////////////////////////////////////////////

// Matrix() - object constructor
function Matrix(h, w) {
	/*Properties */
  this.height = h;
	this.width = w;
	this.rows = new Vector(w);
	
	// set up this.rows. 
	for (var r = 0; r < this.height; r++) {
		var theRow = new Vector(w);

		for (var c = 0; c < this.width; c++) {
		  theRow.addElement(null);
		}
		this.rows.addElement(theRow);
	}
	
	/*Methods*/
	this.elementAt = elementAt;
	this.setElementAt = setElementAt;
	this.insertRow = insertRow;
	this.insertColumn = insertColumn;
	this.removeRowAt = removeRowAt;
	this.removeColumnAt = removeColumnAt;
	this.getWidth = getWidth;
	this.getHeight = getHeight;
	this.toString = toString;
}

// getElementAt() - returns a value from the given row/column.
function elementAt(row, col) {
	try {
		var theRow = this.rows.getElementAt(row);
		return theRow.getElementAt(col);
	}
	catch(e) {
		return "Invalid index";
	}
}

// setElementAt() - sets a value at a given row/column
function setElementAt(value, row, col) {
	if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
		return "Matrix object out of Bounds";
	}
	var theRow = this.rows.getElementAt(row);
	theRow.insertElementAt(value, col);
}

// insertRowAt() - Inserts a blank row at the end.
function insertRow() {
	try {
		this.height++;
		var theRow = new Vector(this.width);
		for (var r = 0; r < this.width; r++) {
			theRow.addElement(null);
		}
		this.rows.insertElementAt(theRow, this.height-1);
	}
	catch (e) {
		return "Excecption occured " + e;
	}
}

// insertColumnAt() -- Inserts a column at the end.
function insertColumn() {
	try {
		this.width++;
		
		for (var c=0; c < this.height; c++) {
			this.rows.getElementAt(c).insertElementAt(null, this.width-1);
		}		
	}
	catch (e) {
		return "Invalid column number";
	}
}

// removeRowAt() - removes a row at a given index.
function removeRowAt(row) {
	try {
		var result = this.rows.getElementAt(row);
		this.height--;
		
		for (var r=row + 1; r <= this.height; r++) {
			var theRow = this.rows.getElementAt(r);
			this.rows.insertElementAt(theRow, r-1);
			this.rows.removeElementAt(r);
		}

		return result;
	}
	catch (e) {
		return "Invalid row number";
	}
}

// removeColumnAt() - removes a given column
function removeColumnAt(col) {
	try {
		var result = new Vector(this.height);
		this.width--;
		
		for(var r = 0; r < this.height; r++) {
			var element = this.rows.getElementAt(r).removeElementAt(col);
			result.addElement(element);
		}
			
		return result;
	}
	catch (e) {
		return "Invalid column number";
	}
}

// getWidth() - returns the Matrix width
function getWidth() {
	return this.width;
}

// getHeight() - returns the Matrix height
function getHeight() {
	return this.height;
}

// toString() - returns String data about the Matrix object
function toString() {
	var s = "Height: " + this.height + " Width: " + this.width + " Rows: " + this.rows;
	return s;
}
	
			