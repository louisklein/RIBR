%% playSnake;
function fig = playSnakeFix(fig)

fig.snake.testing = 1;
if ~exist('fig','var') || ~isfield(fig,'h')
    fig.snake.testing = 1;
    fig.h = figure;
    fig.snake.timeout = 3;
end

%Size of the 'playing field'.
fig.snake.xmax = 30;
fig.snake.ymax = 30;
fig.snake.grid = zeros(fig.snake.xmax,fig.snake.ymax);

%Starting position.
fig.snake.x = 15;
fig.snake.y = 15;
fig.snake.grid(fig.snake.x,fig.snake.y) = 1;

fig.snake.mylength = 1;     %fig.snake.mylength of snake
fig.snake.positionX = zeros(fig.snake.mylength);  %array holds all the coordinates
fig.snake.positionY = zeros(fig.snake.mylength);  %  of the snake's body elements
fig.snake.positionX(1) = fig.snake.x;
fig.snake.positionY(1) = fig.snake.y;

%Position of the food.
fig.snake.xfood = fig.snake.x;
fig.snake.yfood = fig.snake.y;
fig = getNewFood(fig);

fig.snake.justGotFoodFlag = 0;
fig.snake.gameover = 0;

set(fig.h,'menubar','none');


% ADJUST THE SIZE AND POSITION HERE IF DESIRED.

% set(fig.h,'position',[724 46 200 200]);

set(fig.h,'CurrentObject',imagesc(fig.snake.grid));
set(fig.h,'KeyPressFcn',@keyPress);

drawnow;
tic
fig.snake.starttime = toc;
set(fig.h,'UserData',fig);
while (fig.snake.starttime+toc) < fig.snake.timeout
    pause(.01);
    if fig.snake.gameover
        
        fig.snake.gameover = 0;
        break
    end
    fig = get(fig.h,'UserData');
end
fprintf('TimeOut!!\n');
fig = snakeGameOver(fig);

end
%% Called for any key press.
function keyPress(~,evt)
youGottaMove(evt.Key);

% set(fig.h,'UserData',fig);
fig = get(gcf,'UserData');

while ~fig.snake.gameover && (fig.snake.starttime+toc) < fig.snake.timeout
    pause(0.1);
    set(gcf,'UserData',fig);
    if fig.snake.gameover || isempty(get(gcf,'KeyPressFcn'))
        break
    else
        youGottaMove(evt.Key);
    end
    fig = get(gcf,'UserData');
end
end

%% Called after a keypress or after timedelay (?? timedelay??)
function youGottaMove(mov)
% fprintf('You gotta move\n');
makeMovement(mov);
% set(fig.h,'UserData',fig);
fig = get(gcf,'UserData');
if exist('fig','var') && ~isempty(fig) && isfield(fig,'snake') ...
        && isfield (fig.snake,'gameover') && ~fig.snake.gameover
    fig = checkBody(fig);
    if ~fig.snake.gameover
        fig.snake.justGotFoodFlag = 0;
        
        fig.snake.grid(fig.snake.positionX(1),fig.snake.positionY(1)) = 0;
        
        if (fig.snake.mylength~=1)
            for i = 1:fig.snake.mylength-1
                fig.snake.positionX(i) = fig.snake.positionX(i+1);
                fig.snake.positionY(i) = fig.snake.positionY(i+1);
            end
        end
        
        fig.snake.positionX(fig.snake.mylength) = fig.snake.x;
        fig.snake.positionY(fig.snake.mylength) = fig.snake.y;
        
        fig = checkPosEqFood(fig);
        
        fig.snake.grid(fig.snake.x,fig.snake.y) = 1;
        try
            set(fig.h,'CurrentObject',imagesc(fig.snake.grid));
        end
    end
    try
        set(fig.h,'UserData',fig);
    end
end
end

%% Moves the position of the snake in direction of 'mov' (key)
function makeMovement(mov)
% fprintf('\tmakeMovement\n');
fig = get(gcf,'UserData');
if exist('fig','var') && ~isempty(fig) && isfield(fig,'snake') ...
        && isfield (fig.snake,'gameover') && ~fig.snake.gameover
    % tmp = 1;
    % while 1 % tmp
    switch(mov)
        case 'downarrow'
            if (fig.snake.x==fig.snake.xmax)
                fig = snakeGameOver(fig);
                %                 break;
            end
            fig.snake.x=fig.snake.x+1;
        case 'uparrow'
            if (fig.snake.x==1)
                fig = snakeGameOver(fig);
                %                 break;
            end
            fig.snake.x=fig.snake.x-1;
        case 'rightarrow'
            if (fig.snake.y==fig.snake.ymax)
                fig = snakeGameOver(fig);
                %                 break;
            end
            fig.snake.y=fig.snake.y+1;
        case 'leftarrow'
            if (fig.snake.y==1)
                fig = snakeGameOver(fig);
                %                 break;
            end
            fig.snake.y=fig.snake.y-1;
        otherwise
            % any other key is pressed - keep going
            %             break
    end
    if ~fig.snake.gameover
        try
            set(fig.h,'UserData',fig);
        end
    end
end
%     tmp = 0;
% end
end

%% Checks if new position is part of snake's body
function fig = checkBody(fig)
if (fig.snake.mylength~=1)
    for i = 1 : fig.snake.mylength-fig.snake.justGotFoodFlag
        if (fig.snake.x == fig.snake.positionX(i)) && (fig.snake.y == fig.snake.positionY(i))
            fig = snakeGameOver(fig);
            break
        end
    end
end

end

%% Check if you've reached the food
function fig = checkPosEqFood(fig)

if (fig.snake.x==fig.snake.xfood)&&(fig.snake.y==fig.snake.yfood)
    fig.snake.mylength = fig.snake.mylength + 1;
    fig.snake.positionX(fig.snake.mylength) = fig.snake.x;
    fig.snake.positionY(fig.snake.mylength) = fig.snake.y;
    fig = getNewFood(fig);
    fig.snake.justGotFoodFlag = 1;
end
end

%% Create new food element
function fig = getNewFood(fig)
flag = 1;
while (flag)
    fig.snake.xfood = randi(fig.snake.xmax);
    fig.snake.yfood = randi(fig.snake.ymax);
    flag = 0;
    for i = 1:fig.snake.mylength
        if (fig.snake.xfood==fig.snake.positionX(i)) && (fig.snake.yfood==fig.snake.positionY(i))
            flag=1;
        end
    end
end
fig.snake.grid(fig.snake.xfood,fig.snake.yfood) = 0.5;
end

%%
function doNothing(~,~)
end

%% Closes things up.
function fig = snakeGameOver(fig)
% fig = get(gcf,'UserData');
try
    set(fig.h,'KeyPressFcn',@doNothing);
    fig.snake.grid(:,:) = 0.2;
    set(fig.h,'CurrentObject',imagesc(fig.snake.grid));
    pause(1);
%     fig.snake.gameover_msg = 'Game Over, person!';
    fprintf('%s\n',fig.snake.gameover_msg);
%     waitfor(warndlg(fig.snake.gameover_msg,'Game over:'));
    fig.snake.gameover = 1;
    if fig.snake.testing
        delete(fig.h);
    end
end
end


