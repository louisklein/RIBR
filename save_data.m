% this creates the save.headers handle which contains 4 elements each named
% with a string. Later, this handle gets called and each element is written
% into the current file in header positions
make.headers = {'code','trial','reaction time','response'};
% which locates the mfilename file, then fileparts saves the path, name,
% and extension to a vector?
% should mfilename be m_filename?
% [~,m_filename] = fileparts(which(mfilename));
m_filename = mfilename;
% this names a file and attaches is to the save_dir handle
save_dir = fullfile([fileparts(which(mfilename)),'data']);
% this checks whether the filename attached to save_dir already has a
% directory, and if it doesn't then it makes a folder for it
% should mfilename be m_filename?
if ~exist(save_dir,'dir')
    mkdir(save_dir);
end
save_code = '9999'; % participant id
% why does it call on save_code? Does save_code do anything?

% this is an on/off setting which will increment when on from 1. while this
% is happening, it checks whether a save file exists, if it doesn't it
% creates it with .dat data type, and writes in the current increment along
% with the filename
save_num = 0;
while 1
    save_num = save_num + 1;
    save_file = sprintf('%s_%s%i.dat',save_code,m_filename,save_num);
    % sprintf saves the objects into a formatted string, here it says that
    % save_code is a string, m_filename is a string, and save_num is an
    % integer
    save_fullfile = fullfile(save_dir,save_file);
    % if there's no file to save to, the loop breaks - but only the
    % conditional loop, not the while loop - this means that if there is no
    % save file no further increments are made
    if ~exist(save_fullfile,'file')
        break
    end
end

% this loops through the number of elements in the eg_headers handles -
% since eg_headers contains 4 elements, the loop will start at 1 and
% continue printing the string at that element followed by a tab - until it
% reaches the final element, then it ends on a new line
fid = fopen(save_fullfile,'w');
% fid is a set of coordinates associated with some file which fopen reads,
% in this case it reads save_fullfile for writing and deletes whatever it
% already contains
for i = 1 : numel(make.headers)
    if i < numel(make.headers)
        fprintf(fid,'%s\t',make.headers{i});
    else
        fprintf(fid,'%s\n',make.headers{i});
    end
end
% since the for loop has written in headers to the file, fclose terminates
% 'w' access for fid
fclose(fid);

% start timer
tic

number_trials = numel(fig.stim.list.use);
% this imagines a vector between i and number_trials which is 12 units long
for i = 1 : number_trials
    
%     % present the stimulus
%     tic % sim onset.
    
    % this opens save_fullfile in order to add information to it
    fid = fopen(save_fullfile,'a');
    % this might get the file identifier of save_fullfile and then applies
    % the pink format to the string save_code, tabs, the current trial
    % number which is an integer and tabs, then generates a random number
    % and rounds it to the nearest 2dp, tabs, and adds the string 'edit'
    % before terminating on a new line
%     fprintf(fid,'%s\t%i\t%2.2f\t%s\n',save_code,i,round(rand*12,2),'foobar');
    rt = toc;
    fprintf(fid,'%s\t%i\t%2.2f\t%s\n',save_code,i,rt,'foobar');
    
    fclose(fid);
    % since the for loop specifies that there are 12 values of i for which
    % this needs to occur, it loops through until it runs out of vector and
    % ends
end
% the diary then saves some metadata
fprintf('Data saved to: %s (%s)\n',save_file,save_dir);