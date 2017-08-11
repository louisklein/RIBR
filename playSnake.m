%% playSnake;
function fig = playSnake(fig)

testing = 0;
if ~exist('fig','var') || isempty(fig)
    testing = 1;
    fig.h = figure;
end
%Size of the 'playing field'.
xmax = 40;
ymax = 40;
grid = zeros(xmax,ymax);

%Starting position.
x = 5;
y = 5;
grid(x,y) = 1;

length = 1;     %length of snake
positionX = zeros(length);  %array holds all the coordinates
positionY = zeros(length);  %  of the snake's body elements
positionX(1) = x;
positionY(1) = y;

%Position of the food.
xfood = x;
yfood = y;
getNewFood()

justGotFoodFlag = 0;
gameover = 0;

% set(fig.h,'menubar','none');

       
% ADJUST THE SIZE AND POSITION HERE IF DESIRED.

% set(fig.h,'position',[724 46 200 200]);

set(fig.h,'CurrentObject',imagesc(grid));
set(fig.h,'KeyPressFcn',@keyPress);

%% Called for any key press.
    function keyPress (~,evt)
        youGottaMove(evt.Key);

        while(~gameover)
            pause(0.1);
            youGottaMove(evt.Key);
        end
    end
   
%% Called after a keypress or after timedelay
    function youGottaMove(mov)
        makeMovement(mov);
        
        if ~gameover    
            checkBody();
            if ~gameover
                justGotFoodFlag = 0;

                grid(positionX(1),positionY(1)) = 0;

                if (length~=1)
                    for i = 1:length-1
                        positionX(i) = positionX(i+1);
                        positionY(i) = positionY(i+1);
                    end
                end

                positionX(length) = x;
                positionY(length) = y;

                checkPosEqFood()

                grid(x,y) = 1;
                set(fig.h,'CurrentObject',imagesc(grid));
            end
        end
    end
    
%% Moves the position of the snake in direction of 'mov' (key)
    function makeMovement(mov)
        tmp = 1;
        while tmp
            switch(mov)
                case 'downarrow'
                    if (x==xmax)
                        gameOver();
                        break;
                    end
                    x=x+1;
                case 'uparrow'
                    if (x==1)
                        gameOver();
                        break;
                    end
                    x=x-1;
                case 'rightarrow'
                    if (y==ymax)
                        gameOver();
                        break;
                    end
                    y=y+1;
                case 'leftarrow'
                    if (y==1)
                        gameOver();
                        break;
                    end
                    y=y-1;
            end
        tmp = 0;    
        end
    end

%% Checks if new position is part of snake's body
    function checkBody() 
        if (length~=1)
            for i=1:length-justGotFoodFlag
                if (x==positionX(i))&&(y==positionY(i))
                    gameOver();
                    break;
                end
            end
        end
        
    end

%% Check if you've reached the food
    function checkPosEqFood() 
        if (x==xfood)&&(y==yfood)
            length = length + 1;
            positionX(length) = x;
            positionY(length) = y;
            getNewFood();
            justGotFoodFlag = 1;
        end
    end

%% Create new food element
    function getNewFood()
        flag = 1;
        while (flag)
                xfood = randi(xmax);
                yfood = randi(ymax);
                flag = 0;
                for i = 1:length
                    if (xfood==positionX(i)) && (yfood==positionY(i))
                        flag=1;
                    end
                end
        end
        grid(xfood,yfood) = 0.5;
    end

    function doNothing(~,~)
    end

%% Closes things up.
    function gameOver()
       set(fig.h,'KeyPressFcn',@doNothing);
       grid(:,:) = 0.2;
       set(fig.h,'CurrentObject',imagesc(grid));
       pause(1);
%        close (fig.h);
       disp('Gameover, maaaan!');
       gameover = 1;
       if testing
           delete(fig.h);
       end
    end

end
