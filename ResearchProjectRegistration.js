//Mostly a cut and paste of functions from Wikarekare.org's admin pages supporting js library, with minor localization.

var select_ids_for_departments = [];

var faculty_departments;

//Mostly for the "Members Table, when Institute is UoA"
function populate_a_select_with_faculty_departments(the_select_id) {
    var select_id = document.getElementById(the_select_id);

    for(var f in window.faculty_departments) {
        var optgroup = document.createElement("optgroup");
        optgroup.label = f;
        select_id.appendChild(optgroup);
        for(var d in window.faculty_departments[f]) {
            var option = document.createElement("option");
            option.value = d;
            option.text = window.faculty_departments[f][d];
            select_id.appendChild(option);
        }
    }
}

//Set up department select. 
function populate_faculty_departments_callback(data) {
    window.faculty_departments = {};
    for(var f in data) window.faculty_departments[f] = data[f];

    for(var the_select_id in select_ids_for_departments )
        populate_a_select_with_faculty_departments(select_ids_for_departments[the_select_id]);
}

function populate_faculty_departments(the_select_id) {
    select_ids_for_departments.push(the_select_id);
    ajax_get_call("departments.json", null, populate_faculty_departments_callback, ajax_error);
}


//fetch users existing projects from DB
//POC version inserts fake projects.
function add_existing_projects() {
    var select = document.getElementById("project_reference");
    var option1 = document.createElement("option");
    option1.value = "UoA123456";
    option1.text = "UoA123456";
    select.appendChild(option1);
    
    var option2 = document.createElement("option");
    option2.value = "UoA654321";
    option2.text = "UoA654321";
    select.appendChild(option2);
}

//Default roles. Might be good to have a role editor embedded in web page
var roles = [];
var roles_loaded_completion = null;

function load_roles_callback(data) {
    for(var r in data.roles) window.roles.push(data.roles[r]);
    if(roles_loaded_completion != null) window.roles_loaded_completion();
}

function ajax_error(jqXHR, textStatus, errorMessage) {
    alert('Error: ' + jqXHR != null ? jqXHR.status.toString() : '' + '\n' + errorMessage);
}

function load_roles(roles_loaded_completion_function) {
    roles_loaded_completion = roles_loaded_completion_function;
    ajax_get_call("roles.json", null, load_roles_callback, ajax_error);
}

function add_role(new_role) { 
    for(var r in roles) if(roles[r] == new_role) return;
    roles.push(new_role);
}

//Create research project member "Role" select
function create_role_select(id, index, selected_row) {
    var select = document.createElement("select");
    select.id = id
    if(selected_row == null) {
        if(index == 0) selected_row = 'PI';
        else selected_row = "Researcher";
    }
    for(var r in roles) {
        var option = document.createElement("option");
        option.value = roles[r];
        option.text = roles[r];
        if(roles[r] == selected_row) option.selected = true;
        select.appendChild(option);
    }
    return(select)
}

//Generic input field for the research group member table
function create_input(id, type, value, size) {
    var input = document.createElement("input");
    input.id = id;
    input.setAttribute("type", type);
    if(value != null) {
        if(type == 'checkbox') input.checked = value; 
        else input.value = value; 
    }
    if(size != null) input.size = size;
    return input;
}

//Empty research group member record, for initial creation.
var empty_member_record = {
    "role": null,
    "name": "",
    "orcid": "",
    "login": "",
    "department": "",
    "institute": "UoA",
    "email": "",
    "checked": false
}

//Either add a new blank researcher entry
//Or fill in the table with existing members
function add_member(member_record) {
  var members = document.getElementById("members");
  var row_num = members.rows.length;
  var row = members.insertRow(row_num);
  var cell;
  if(member_record == null) member_record = empty_member_record;
  cell = row.insertCell(0); cell.appendChild(create_role_select("role_" + row_num, row_num, member_record.role)); //Role
  cell = row.insertCell(1); cell.appendChild(create_input("name_" + row_num,"text",member_record.name,"64")); //Name
  cell = row.insertCell(2); cell.appendChild(create_input("orcid_" + row_num,"text",member_record.orcid,"24")); //ORCID
  cell = row.insertCell(3); cell.appendChild(create_input("login_" + row_num,"text",member_record.login,"10")); //Login
  cell = row.insertCell(4); cell.appendChild(create_input("institute_" + row_num,"text",member_record.institute,"24")); //Institute
  cell = row.insertCell(5); cell.appendChild(create_input("department_" + row_num,"text",member_record.department,"32")); //Department
  cell = row.insertCell(6); cell.appendChild(create_input("email_" + row_num,"text",member_record.email,"24")); //Email
  cell = row.insertCell(7); cell.appendChild(create_input("checked_" + row_num,"checkbox", member_record.checked, null)); //Select for Action
  document.getElementById("name_" + row_num).select();
}

//Turn the members table entries into a json record.
function fetch_member(m) {
    return {
        "role": document.getElementById("role_" + m).value,
        "name": document.getElementById("name_" + m).value,
        "orcid": document.getElementById("orcid_" + m).value,
        "login": document.getElementById("login_" + m).value,
        "department": document.getElementById("department_" + m).value,
        "institute": document.getElementById("institute_" + m).value,
        "email": document.getElementById("email_" + m).value,
        "checked": document.getElementById("checked_" + m).checked
    };
}

//Turn HTML table into Json array.
function fetch_members(members) {
    for(var m = 0; m < members.rows.length; m++)
        members.push(fetch_member(m));
}

//separate members into the ones with the checkbox ticked , and those that aren't.
function checked_unchecked(checked, unchecked) {
    for(var m = 0; m < members.rows.length; m++)
        if(document.getElementById("checked_" + m).checked) 
            checked.push( fetch_member(m) );
        else unchecked.push(fetch_member(m));
}
//Might want an undo, from the recorded deletions ;)
var last_deleted_members = [];

//Record and report the deletions to the server :) (haven't reported the deletions)
function delete_members() {
    var members = document.getElementById("members");
    var unchecked = [];
    
    last_deleted_members = [];
    checked_unchecked(last_deleted_members, unchecked); 
           
    for(var m = members.rows.length; m > 0; m--)
        members.deleteRow(m-1);
        
    for(var m in unchecked)
        add_member(unchecked[m]); 
}

//Restore the members list to before the last delete.
function undo_delete_members() {
    for(var m in last_deleted_members)
        add_member(last_deleted_members[m]); 
    last_deleted_members = [];
}

//Additional form fields are hidden, to make form simpler.
function show_div(div_id) {
  document.getElementById(div_id).style.display = 'block';
}
function hide_div(div_id) {
  document.getElementById(div_id).style.display = 'none';
}

var expanded_image = new Image();
var unexpanded_image = new Image();
var toggle_inited = false;

function toggle_init() {
    expanded_image.src="images/expandedTriangle.gif";
    unexpanded_image.src = "images/closedTriangle.gif";
    toggle_inited = true;
}

function toggle_div(div_id) {
  if(!toggle_inited) toggle_init();
  var the_div = document.getElementById(div_id);
  the_div.style.display = the_div.style.display == 'block' ? 'none' : 'block' ;
  var the_image = document.getElementById(div_id + '_expand');
  the_image.src = the_div.style.display == 'block' ? expanded_image.src : unexpanded_image.src;
}


var div_group = ['research_data', 'research_vm', 'group_editor'];
function select_div(div_id) {
    for(var d in div_group) hide_div(div_group[d]);
    show_div(div_id);
    return false;
}

function set_group_name(group_suffix) {
    var group_name_field = document.getElementById("group_name");
    var project_reference = document.getElementById("project_reference").value;
    group_name_field.value = project_reference + "_" + group_suffix;
}

//Wait for "delay" seconds, then do an async ajax call, using POST, and passing JSON
//Useful for fetching data every "delay" seconds, by calling at the end of the callback function.
function delayed_ajax_post_call(url,args,callback, error_callback, delay) {
    setTimeout(function () {ajax_post_call(url , args, callback, error_callback); }, delay );
}

//Do an async ajax call, using POST, and passing JSON
function ajax_post_call(url, args, callback, error_callback) {
  var newDataRequest = $.ajax( url, {
       type: 'POST',
       data: args,
       dataType: 'json', // type of response data
       cache: false,
       timeout: 3600000, // timeout after 5 minutes
       success: callback ,
       error: error_callback
     });
}

//Do an async ajax call, using GET
function ajax_get_call(url, args, callback, error_callback) {
  var newDataRequest = $.ajax( url, {
       type: 'GET', //default behaviour
       data: args,
       timeout: 3600000, // timeout after 5 minutes
       dataType: 'json', // type of response data
       cache: false,
       success: callback , //Changing to done in js 1.8
       error: error_callback //, //Changing to fail
       //complete: completion_callback //Changing to always.
     });
}

var ARGV = {};

//Parsing parameters in an HTML file, so we can use an html file as a cgi
//and populate the form based on args passed in.
function getURLParameters()
{
    var sURL = window.document.URL.toString();
    if (sURL.indexOf("?") > 0)
    {
        var arrParams = sURL.split("?");
        var arrURLParams = arrParams[1].split("&");

        var i = 0;
        for (i = 0; i<arrURLParams.length; i++)
        {
            var sParam =  arrURLParams[i].split("=");
            key = unescape(sParam[0]);
            value = sParam[1];
            if(ARGV[key] == null)
                ARGV[key] = value;
            else if(typeof ARGV[key] === 'string')
                ARGV[key] = [ ARGV[key], value ];
            else 
                ARGV[key].push(value);
        }
    }
}


