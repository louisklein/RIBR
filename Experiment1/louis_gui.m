%% Louis' GUI to run his first experiment
%
% date: 07-June-2017
%
% authors:
% - Louis Klein
% - Nic Badcock
%
% Aims:
% - create figure window for experimental presentation
% - give it 'hot key' functions
% - make it save stuff
% - demonstrate:
%   * presenting text
%   * deleting/removing text
%   * edit box
%   * button
%   * read in data/csv stimulus file to display

%% setup as a function
function  louis_gui
% clears the command window
% clc;
% close all

% making a figure
fig.set.position = [.0 .0 1.0 1.0];
fig.col = myColours;
fig.set.background_colour = fig.col.grey;
fig.set.letter_pause_sec = 1;
fig.set.item_duration_sec = 8;
fig.set.item_inter_stimulus_interval_sec = 3;

fig.set.item_xy = [.5 .7];

fig.set.quit_key = '9';

% toggle test mode
fig.set.test_time = 1;
fig.set.get_inputs = 1;
if fig.set.test_time
    fig.set.letter_pause_sec = .5;
    fig.set.item_duration_sec = 2;
    fig.set.item_inter_stimulus_interval_sec = 2;
end
%% read in stim file

fig.stim.file = 'Retrieval_Practise.csv';
fig.stim.dir = fileparts(which(mfilename));
fig.stim.fullfile = fullfile(fig.stim.dir,fig.stim.file);
fig = readStimFile(fig);
fig.stim.list.use = fig.stim.list.FA1;

%% save settings
% fig.tmp.current_dir = pwd;
% cd(fullfile(pwd,'..'));
% fullfile(pwd,[mfilename,'_data']); %[pwd,'Data'];
% cd(fig.tmp.current_dir); % change back to original dir.

% this loop sets a directory which will be saved to - first it checks if
% there is a current data file, if there is none it will create one before
% terminating.
% why is the save.dir pointing to stim.dir?

fig = saveSetup(fig);

fig.h = figure(...
    'Units','Normalized',...
    'Position',fig.set.position,...
    'KeyPressFcn',@getKeyPress,...
    'DeleteFcn',@closeGui,...
    'MenuBar','none',...
    'ToolBar','none',...
    'Color',fig.set.background_colour ... % no comma after this
    );

fig.tmp.edit_box = uicontrol('Parent',fig.h,'Style','Edit',...
    'units','normalized',...
    'FontName', 'Cambria',...
    'FontSize', 16,...
    'Position',[.4 .45 .2 .05],... % sets the position as a division of the figure size
    'CallBack',@getResponse,...
    'Tag','box',....
    'UserData',1,'Visible','off');

set(fig.h,'UserData',fig);

% now show the instructions
runInstructions(fig);

end


%% myColours
% - list of colours I might want to use
function col = myColours
col.black = [.05 .05 .05];
col.blue = [.3 .3 .8];
col.grey = [.99 .99 .99];
end

%% getKeyPress
function getKeyPress(h,event_data)
fig = get(h,'UserData');
%fprintf('\tKey pressed!!\n');

% I think this is making another set of axes where the lengths are not
% equal and cause the bug - I tried to debug this, but I wasn't able to
% text_handle = text(1,1,event_data.Key,...
%     'BackgroundColor',fig.set.background_colour,...
%     'Visible', 'on');
%
% parent_handle = get(text_handle,'Parent');
% set(parent_handle,'Color',fig.set.background_colour);
% set(parent_handle,'Visible','off');
% pause(fig.set.letter_pause_sec);

% why is this both before and after the switch?
% delete(text_handle);
switch event_data.Key
    case {'0','1','2'}
        switch fig.phase.current
            case {''}
                delete(get(gca,'Children'));
                switch event_data.Key
                    case '0'
                        runInstructions(fig);
                    case '1'
                        fig = runStimList(fig);
                    case '2'
                        fig = runPhase2(fig,'phase_two');
                    case '3'
                        fig = runPhase2(fig,'phase_three');
                end
            otherwise
                fprintf('I''m running %s, please wait until it''s finished or hit ''%s'' to quit\n',fig.phase.current,fig.set.quit_key);
                set(fig.h,'Name',sprintf('Running: %s',fig.phase.current));
        end
    case fig.set.quit_key
        delete(fig.h);
    otherwise
        fprintf('The ''%s'' key doesn''t do anything, yet...\n', event_data.Key)
end
set(h,'UserData',fig);
% pause(fig.set.letter_pause_sec);
% delete(text_handle);
end

%%  runInstructions
function  fig = runInstructions(fig)
fig.tmp.stack = dbstack;
fig.phase.current = fig.tmp.stack(1).name;

fig.instruct.continue = 'Press ''Space Bar'' to continue.';
fig.instruct.continue_format = '\n\n%s';
fig.instruct.texts = {...
    {'Once upon a time you will see words.',... % instruction 1: line 1
    'Remember them!!!',... % instruction 1: line 2
    'more'},... % instruction 1: line 3
    {'And something else will happen - watch yourself...'... % instruction 2: line 1
    }...
    {'Press ''0'' to see instructions again',...
    'Press ''1'' to run phase 1',...
    'Press ''2'' to run phase 2'} ...
    };
fig.instruct.text = [];
fig.phase.running = 0;
for i = 1 : numel(fig.instruct.texts)
    
    if i == numel(fig.instruct.texts)
        fig.instruct.continue = '';
    end
    fig.instruct.text{i} =  sprintf(...
        [repmat('%s\n\n',1,numel(fig.instruct.texts{1})),fig.instruct.continue_format],... % create formatting string
        fig.instruct.texts{i}{:},fig.instruct.continue);
end

% fig.instruct.text = {... sprintf('%s\n\n%s',fig.instruct.texts{1},fig.instruct.continue),...
%     sprintf([repmat('%s\n\n',1,numel(fig.instruct.texts{1})),fig.instruct.continue_format],... % create formatting string
%     fig.instruct.texts{1}{:},fig.instruct.continue),...
%     sprintf([repmat('%s\n\n',1,numel(fig.instruct.texts{2})),fig.instruct.continue_format],...
%     fig.instruct.texts{2}{:},fig.instruct.continue),... sprintf('%s\n\n%s',fig.instruct.texts{2},fig.instruct.continue),...
%     sprintf(['Press ''0'' to see instructions again\n',...
%     'Press ''1'' to run phase 1\n',...
%     'Press ''2'' to run phase 2'])};
set(fig.h,'UserData',fig);
for i = 1 : numel(fig.instruct.text)
%     fig.phase.running = 1;
    fig.tmp.text_handle = text(...
        .5,.5,fig.instruct.text{i},...
        'HorizontalAlignment','center');
    if i < numel(fig.instruct.text)
    waitforbuttonpress; %(fig.h);
    delete(fig.tmp.text_handle);
    end
end
fig.phase.current = '';
set(fig.h,'UserData',fig);
end

%% runStimList
function fig = runStimList(fig)
fig.tmp.stack = dbstack;
fig.phase.current = fig.tmp.stack(1).name;
set(fig.h,'UserData',fig);

fprintf('Attempting to run list:\n');

makeaxes = gca(fig.h);
set(makeaxes,'Parent', fig.h,...
    'Position',[.1 .1 .8 .8],...
    'Visible','off');
% ...
%     'PlotBoxAspectRatioMode','manual',...
%     'PlotBoxAspectRatio',[1,1,1],...
%     'DataAspectRatioMode','manual',...
%     'DataAspectRatio',[1 1 1],...
%     'Visible','on');

% checks that the correct directory is being read
if isfield(fig,'stim') && isfield(fig.stim,'list') && isfield(fig.stim.list,'use')
    
    for i = 1 : numel(fig.stim.list.use)
        fprintf('\t%i: %s\n',i,fig.stim.list.use{i});
        try
            text_handle = text(fig.set.item_xy(1),fig.set.item_xy(2),...
                fig.stim.list.use{i},...
                'Parent',makeaxes,'Units','Normalized',...
                'HorizontalAlignment','center',...
                'BackgroundColor',fig.set.background_colour,...
                'Color',fig.col.black,...
                'FontSize',25,'FontName','Cambria');
        catch err
            delete(fig.h);
            error('Axes gone!!');
            %             error('Program terminated for a specific reason')
        end
        pause(fig.set.item_duration_sec);
        delete(text_handle);
        pause(fig.set.item_inter_stimulus_interval_sec)
    end
else
    warndlg('Can''t find list!!');
end
fprintf('Finished\n');
fig.phase.current = '';
set(fig.h,'UserData',fig); % update user data
end

%% runPhase2
function fig = runPhase2(fig,phase_name)
fig.tmp.stack = dbstack;
fig.phase.current = fig.tmp.stack(1).name;
set(fig.h,'UserData',fig);

set(fig.tmp.edit_box,'Visible','on');
fig.data.code = fig.save.code;
fig.data.phase = phase_name;
fig.data.phase_three_responses = [];
for i = 1 : numel(fig.stim.list.use)
    fprintf('\t%i: %s\n',i,fig.stim.list.use{i});
    
%     fig.save.headers = {'code','trial','stimulus','reactiontime','response'};
    
    fig.data.trial = i;
    switch phase_name
        case 'phase_two'
            fig.data.stimulus = fig.stim.list.use{i};
        case 'phase_three'
            fig.data.stimulus = fig.stim.list.use{i};
    end
    fig.data.reactiontime = -9999;
    fig.data.response = 'empty';
    fig.data.correct = 0;
    set(fig.h,'UserData',fig);
    try
        tic;
        text_handle = text(fig.set.item_xy(1),fig.set.item_xy(2),...
            fig.data.stimulus,...
            'Parent',gca,'Units','Normalized',...
            'HorizontalAlignment','center',...
            'BackgroundColor',fig.set.background_colour,...
            'Color',fig.col.black,...
            'FontSize',25,'FontName','Cambria');
    catch err
        delete(fig.h);
        error('Axes gone!!');
        %             error('Program terminated for a specific reason')
    end

    set(fig.tmp.edit_box,'Visible','On');
    uicontrol(fig.tmp.edit_box);
    while 1
        fig = get(fig.h,'UserData');
        if isfield(fig,'data')
            switch fig.data.response
                case 'empty'
                    % keep waiting for a response
                case 'quit4menow'
                    delete(fig.h);
                otherwise
                    if strcmpi(fig.data.response,fig.data.stimulus)
                        fig.data.correct = 1;
                    end
                    break
            end
        end
        pause(.1);
    end
    fig.data.reactiontime = toc;
    tic;
%     figure(fig.h); % stop focussing on text box
    set(fig.tmp.edit_box,'Visible','Off');
    delete(text_handle);
    set(fig.tmp.edit_box,'String','');

    % save the data
    fig = saveData(fig);
    
    
    switch phase_name
        case 'phase_three'
            fig.data.phase_three_responses{end+1} = fig.data.response;
            % present this on the screen like the instuctions
            % 
    end
    while toc < fig.set.item_inter_stimulus_interval_sec
        
        pause(.1);
    end
end

fig.phase.current = '';
end

%% readStimFile
function fig = readStimFile(fig)

fprintf('Running ''readStimFile'' on: %s (%s)\n',fig.stim.file,fig.stim.dir);

fig.stim.data = importdata(fig.stim.fullfile,',');
fig.stim.headers = [];

remaining_text = fig.stim.data{1};
while ~isempty(remaining_text)
    [fig.stim.headers{end+1},remaining_text] = strtok(remaining_text,',');
end

fig.stim.list = [];
%     fig.stim.list.FA1 = [];
%     fig.stim.list.FA2 = [];

for i = 1 : numel(fig.stim.headers)
    fig.stim.list.(fig.stim.headers{i}) = [];
end

for i = 2 : size(fig.stim.data,1)
    rem = fig.stim.data{i};
    for j = 1 : numel(fig.stim.headers)
        [fig.stim.list.(fig.stim.headers{j}){end+1},rem] = strtok(rem,',');
    end
end

fprintf('\tdone.\n');
end

%% getResponse
function getResponse(h,event)
% gets the current figure - which is h - and asks for UserData which is a
% vector that has stored information
fig = get(gcf,'UserData');
fprintf('Response:');
% handle stores whatever information in figure h has with string properties
response = get(h,'String');

% handle stores the print command
response_text = sprintf('''%s'' typed into box %i',response);
% opens a warning that displays response_text
% warndlg(response_text,'Response!');
% this just prints the same line to the command window for debugging
fprintf('\t%s\n',response_text);
% this tells the get inside the response handle to look at the file
% associated with the UserData of the current figure
fig.data.response = response;
% sets the value of the current figure to be whatever is in fig, which is
% UserData in the current figure, with the tag UserData
% tbh not exactly sure what this is doing...
set(gcf,'UserData',fig);
end

%% saveSetup
function fig = saveSetup(fig)
fig.tmp.stack = dbstack;

if fig.set.get_inputs
    fig.save.code = inputdlg('Participant number:','ID:');
end
if ~isfield(fig,'save') && ~isfield(fig.save,'code') && isempty(fig.save.code)
    fig.save.code = {'9999'};
end
fig.save.code = fig.save.code{1};

% fig.save.dir = [fig.stim.dir,'data'];
% if ~exist(fig.save.dir,'dir')
%     mkdir(fig.save.dir);
% end



% this creates the save.headers handle which contains 4 elements each named
% with a string. Later, this handle gets called and each element is written
% into the current file in header positions
fig.save.headers = {'code','trial','phase','stimulus','response','correct','reactiontime'};
% which locates the mfilename file, then fileparts saves the path, name,
% and extension to a vector?
% should mfilename be m_filename?
% [~,m_filename] = fileparts(which(mfilename));
fig.save.task_name = fig.tmp.stack(2).name;
% this names a file and attaches is to the save_dir handle
fig.save.dir = fullfile([fileparts(which(fig.save.task_name)),'data']);
% this checks whether the filename attached to save_dir already has a
% directory, and if it doesn't then it makes a folder for it
% should mfilename be m_filename?
if ~exist(fig.save.dir,'dir')
    mkdir(fig.save.dir);
end
% save_code = fig.save.code; %'9999'; % participant id
% why does it call on save_code? Does save_code do anything?

% this is an on/off setting which will increment when on from 1. while this
% is happening, it checks whether a save file exists, if it doesn't it
% creates it with .dat data type, and writes in the current increment along
% with the filename
fig.save.number = 0;
while 1
    fig.save.number = fig.save.number + 1;
    fig.save.file_name = sprintf('%s_%s%i.dat',fig.save.code,fig.save.task_name,fig.save.number);
    % sprintf saves the objects into a formatted string, here it says that
    % save_code is a string, m_filename is a string, and save_num is an
    % integer
    fig.save.fullfile = fullfile(fig.save.dir,fig.save.file_name);
    % if there's no file to save to, the loop breaks - but only the
    % conditional loop, not the while loop - this means that if there is no
    % save file no further increments are made
    if ~exist(fig.save.fullfile,'file')
        break
    end
end

fig.save.diary_file = sprintf('diary_%s_%i.txt',fig.save.code,fig.save.number);
fig.save.diary_fullfile = fullfile(fig.save.dir,fig.save.diary_file);
diary(fig.save.diary_fullfile);

% this loops through the number of elements in the eg_headers handles -
% since eg_headers contains 4 elements, the loop will start at 1 and
% continue printing the string at that element followed by a tab - until it
% reaches the final element, then it ends on a new line
fid = fopen(fig.save.fullfile,'w');
% fid is a set of coordinates associated with some file which fopen reads,
% in this case it reads save_fullfile for writing and deletes whatever it
% already contains
for i = 1 : numel(fig.save.headers)
    if i < numel(fig.save.headers)
        fprintf(fid,'%s\t',fig.save.headers{i});
    else
        fprintf(fid,'%s\n',fig.save.headers{i});
    end
end
% since the for loop has written in headers to the file, fclose terminates
% 'w' access for fid
fclose(fid);

end


%% saveData
function fig = saveData(fig)

fid = fopen(fig.save.fullfile,'a');
% this might get the file identifier of save_fullfile and then applies
% the pink format to the string save_code, tabs, the current trial
% number which is an integer and tabs, then generates a random number
% and rounds it to the nearest 2dp, tabs, and adds the string 'edit'
% before terminating on a new line
%     fprintf(fid,'%s\t%i\t%2.2f\t%s\n',save_code,i,round(rand*12,2),'foobar');

% fprintf(fid,'%s\t%i\t%2.2f\t%s\n',save_code,i,rt,'foobar');
fig.tmp.delim = '\t';
for i = 1 : numel(fig.save.headers) % = {'code','trial','stimulus','reactiontime','response'};
    fig.tmp.data = fig.data.(fig.save.headers{i});
    fig.tmp.format = '%s';
    if isnumeric(fig.tmp.data)
        fig.tmp.format = '%i';
        if floor(fig.tmp.data) < fig.tmp.data
            fig.tmp.format = '%3.2f';
        end
    end
    if i == numel(fig.save.headers)
        fig.tmp.delim = '\n';
    end
    fprintf(fid,[fig.tmp.format,fig.tmp.delim],fig.tmp.data);
end

fclose(fid);

end
%% closeGui
function closeGui(~,~)
% this turns off the diary, since the diary is associated with
% file.stim.dir and that is the handle for the current file which is unique
% to the participant, when the program runs again with a new participant
% id, the diary will start afresh
fprintf('Closing Gui: saving diary file\n');
diary off
% error('Yep, I''m closing...');
return
end


%linspace(.2,.8,5)